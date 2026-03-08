package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"golang.org/x/sys/windows/registry"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

type Settings struct {
	General GeneralSetting `json:"general"`
	Live    LiveSetting    `json:"live"`
	Account AccountSetting `json:"account"`
	IsFirst bool           `json:"is_first"`
}

type GeneralSetting struct {
	AutoRun bool `json:"autorun"`
}

type LiveSetting struct {
	Chat   bool   `json:"chat"`
	Chzzk  string `json:"chzzk"`
	Soop   string `json:"soop"`
	Weflab string `json:"weflab"`
}

type AccountSetting struct {
	ID       string `json:"id"`
	Nickname string `json:"nickname"`
}

func (a *App) GetSetting() *Settings {
	dataFile, _ := configFile()
	fmt.Println("data File loaded:", dataFile)

	if _, err := os.Stat(dataFile); os.IsNotExist(err) {
		s := &Settings{
			IsFirst: true,
		}
		_ = a.SaveSetting(s)
		return s
	}

	data, err := os.ReadFile(dataFile)
	if err != nil {
		return &Settings{}
	}

	var s Settings
	_ = json.Unmarshal(data, &s)

	return &s
}

func (a *App) SaveSetting(s *Settings) error {
	dataFile, err := configFile()
	if err != nil {
		return err
	}

	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return err
	}

	SetAutoRun(s.General.AutoRun)

	return os.WriteFile(dataFile, data, 0644)
}

func configFile() (string, error) {
	baseDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	appDir := filepath.Join(baseDir, "ZeroLive")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return "", err
	}

	return filepath.Join(appDir, "config.json"), nil
}

func SetAutoRun(enable bool) error {
	exe, err := os.Executable()
	if err != nil {
		return err
	}
	exePath, _ := filepath.EvalSymlinks(exe)

	key, _, err := registry.CreateKey(
		registry.CURRENT_USER,
		`Software\Microsoft\Windows\CurrentVersion\Run`,
		registry.SET_VALUE,
	)
	if err != nil {
		return err
	}
	defer key.Close()

	if enable {
		return key.SetStringValue("ZeroLive", exePath)
	}

	return key.DeleteValue("ZeroLive")
}

type Platforms string

func (a *App) GetLiveStatus(platform Platforms, id string) (bool, error) {
	fmt.Println("채널 정보 요청: ", id)

	switch platform {
	case "soop":
		r, err := parseSoopState(id)
		if err != nil {
			fmt.Println(err)
			return false, err
		}
		return r["result"].(int) == 1, nil
	case "chzzk":
		r, err := parseChzzkState(id)
		if err != nil {
			fmt.Println(err)
			return false, err
		}

		status := r["content"].(map[string]interface{})["status"].(string)
		return status == "OPEN", nil
	}
	return false, fmt.Errorf("unknown platform")
}

func isProcessRunning(name string) bool {
	cmd := exec.Command("tasklist")
	output, err := cmd.Output()
	if err != nil {
		return false
	}

	return strings.Contains(strings.ToLower(string(output)), strings.ToLower(name))
}
func (a *App) StartGoLive() {
	if isProcessRunning("golive.exe") {
		fmt.Println("golive already running")
		return
	}

	exeURL := "https://github.com/as7ar/golive/releases/download/1.0/golive.exe"
	configDir, err := os.UserConfigDir()
	if err != nil {
		fmt.Println(err)
	}

	dir := filepath.Join(configDir, "ZeroLive")
	err = os.MkdirAll(dir, os.ModePerm)
	if err != nil {
		fmt.Println(err)
	}

	filePath := filepath.Join(dir, "golive.exe")

	resp, err := http.Get(exeURL)
	if err != nil {
		fmt.Println(err)
	}
	defer resp.Body.Close()

	out, err := os.Create(filePath)
	if err != nil {
		fmt.Println(err)
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		fmt.Println(err)
	}

	cmd := exec.Command(filePath)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Start()
	if err != nil {
		fmt.Println(err)
	}
}

func parseChzzkState(channelId string) (map[string]interface{}, error) {
	// content.status
	requestURL := fmt.Sprintf("https://api.chzzk.naver.com/polling/v2/channels/%s/live-status", channelId)

	req, _ := http.NewRequest("GET", requestURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("API_ERROR_STATUS_%d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	return result, nil
}

func parseSoopState(bjid string) (map[string]interface{}, error) {
	//r["result"].(string)
	requestURL := fmt.Sprintf("https://live.sooplive.co.kr/afreeca/player_live_api.php?bjid=%s", bjid)

	data := url.Values{}
	data.Set("bid", bjid)
	data.Set("type", "live")
	data.Set("pwd", "")
	data.Set("player_type", "html5")
	data.Set("stream_type", "common")
	data.Set("quality", "HD")
	data.Set("mode", "landing")
	data.Set("is_revive", "false")
	data.Set("from_api", "0")

	req, _ := http.NewRequest("POST", requestURL, strings.NewReader(data.Encode()))
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("API_ERROR: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	//fmt.Println(result)
	channel, ok := result["CHANNEL"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("CHANNEL_NOT_FOUND")
	}

	/*if chpt, ok := channel["CHPT"].(string); ok {
		fmt.Println("Chat Port:", chpt)
	}*/

	return channel, nil
}
