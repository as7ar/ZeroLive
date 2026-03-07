package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

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
