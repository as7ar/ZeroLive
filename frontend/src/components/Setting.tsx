import '../assets/styles/page.css'
import '../assets/styles/setting.css'
import {useEffect, useState} from "react";
import {GetSetting, SaveSetting} from "../../wailsjs/go/main/App";
import {main} from "../../wailsjs/go/models";

export function SettingPage() {
    const [settings, setSettings] = useState<main.Settings | null>(null)
    const [settingTabs, setSettingTabs] = useState<string | null>("general")

    const handleSave = async () => {
        if (!settings) return
        await SaveSetting(settings)
    }

    useEffect(() => {
        GetSetting().then((res) => {
            const s = main.Settings.createFrom(res)
            setSettings(s)
        })
    }, [])

    const platforms = [
        { key: "chzzk", label: "치지직", placeholder: "채널 아이디" },
        { key: "soop", label: "숲", placeholder: "스트리머 아이디" },
        { key: "weflab", label: "위플랩", placeholder: "도우미 아이디" },
    ] as const

    return (
        <div className={"content"}>
            <div className="menu-selection">
                <button className={settingTabs === "general" ? "active" : ""} onClick={() => setSettingTabs("general")}>일반</button>
                <button className={settingTabs === "live" ? "active" : ""} onClick={() => setSettingTabs("live")}>방송</button>
                <button className={settingTabs === "account" ? "active" : ""} onClick={() => setSettingTabs("account")}>계정</button>
            </div>
            <div className="menu-content">
                {settingTabs=="general" && (
                    <div className={"setting"}>
                        <label>
                            <span>컴퓨터 실행 시 자동으로 실행</span>
                            <input
                                type={"checkbox"}
                                checked={settings?.general?.autorun ?? false}
                                onChange={(e) => {
                                    if (!settings) return
                                    const updated = {
                                        ...settings,
                                        general: {
                                            ...settings.general,
                                            autorun: e.target.checked
                                        }
                                    }
                                    setSettings(main.Settings.createFrom(updated))
                                }}
                            ></input>
                        </label>
                    </div>
                )}
                {settingTabs=="live" && (
                    <div className={"setting"}>
                        <label>
                            <span>채팅 보기</span>
                            <input
                                type={"checkbox"}
                                checked={settings?.live?.chat ?? false}
                                onChange={(e) => {
                                    if (!settings) return
                                    const updated = {
                                        ...settings,
                                        live: {
                                            ...settings.live,
                                            chat: e.target.checked
                                        }
                                    }
                                    setSettings(main.Settings.createFrom(updated))
                                }}
                            ></input>
                        </label>
                        {platforms.map((p)=> (
                            <label key={p.key}>{p.label} {p.placeholder}
                                <input
                                    type={"text"}
                                    value={settings?.live?.[p.key]}
                                    onChange={(e)=> {
                                        if (!settings) return
                                        const updated = {
                                            ...settings,
                                            live: {
                                                ...settings.live,
                                                [p.key]: e.target.value
                                            }
                                        }
                                        setSettings(main.Settings.createFrom(updated))
                                    }}
                                ></input>
                            </label>
                        ))}
                    </div>
                )}
                {settingTabs=="account" && (
                    <div className={"setting"}>
                        <div className={`account_id`}>
                            계정 아이디: <a className={settings?.account ? "verified" : "unknown"}>{settings?.account?.id || "알 수 없음"}</a>
                        </div>
                        <div className={`account_name`}>
                            계정 이름: <a className={settings?.account ? "verified" : "unknown"}>{settings?.account?.nickname || "알 수 없음"}</a>
                        </div>
                    </div>
                )}
                <button onClick={handleSave}>저장</button>
            </div>

        </div>
    )
}

