import {useEffect, useState} from "react";
import {main} from "../../../wailsjs/go/models";
import {GetLiveStatus, GetSetting, StartGoLive} from "../../../wailsjs/go/main/App";
import '../../assets/styles/home.css'
import Chat from "./Chat";

type Platform = "weflab" | "soop" | "chzzk"

type PlatformWS = {
    key: Platform
    label: string
    ws: string
}

export default function HomeLive() {
    const [settings, setSettings] = useState<main.Settings | null>(null)
    const [status, setStatus] = useState<Record<string, boolean>>({})
    const [chatType, setChatType] = useState<"all" | Platform>("all")

    useEffect(() => {
        GetSetting().then((res) => {
            const s = main.Settings.createFrom(res)
            setSettings(s)
        })
    }, [])

    const platforms = [
        { key: "chzzk", label: "치지직" },
        { key: "soop", label: "숲"},
    ] as const

    const alertPlatforms: PlatformWS[] = [
        { key: "chzzk", label: "치지직", ws: `ws://localhost:8080/api/chzzk?id=${settings?.live?.chzzk}` },
        { key: "soop", label: "숲", ws: `ws://localhost:8080/api/soop?bjid=${settings?.live?.soop}&chat=${settings?.live?.chat}` },
        { key: "weflab", label: "위플랩", ws: `ws://localhost:8080/api/weflab?key=${settings?.live?.weflab}` },
    ]

    async function loadStatus() {
        const result: Record<string, boolean> = {}
        for (const p of platforms) {
            const id = settings?.live?.[p.key]
            if (!id) {
                result[p.key] = false
                continue
            }
            result[p.key] = await GetLiveStatus(p.key, id)
            console.log(p.label + ":" + result[p.key])
        }
        setStatus(result)
    }
    useEffect(() => {
        if (!settings) return
        loadStatus()
    }, [settings])

    useEffect(() => {
        const sockets: WebSocket[] = []
        alertPlatforms.forEach((p) => {
            if (!p.ws.includes("undefined")) {
                const ws = new WebSocket(p.ws)
                ws.onopen = () => {
                    console.log(p.label + " 연결됨")
                }
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data)

                    if (chatType === "all" || chatType === p.key) {
                        console.log(p.label, data)
                    }
                }
                ws.onerror = (err) => {
                    console.log(p.label + " 에러", err)
                }
                ws.onclose = () => {
                    console.log(p.label + " 연결 종료")
                }
                sockets.push(ws)
            }
        })

        return () => {
            sockets.forEach((s) => s.close())
        }
    }, [settings, chatType])

    return (
        <div className={"home-live"}>
            <div className={"live-status"}>
                {platforms.map((p)=> (
                    <span>{p.label} 방송 상태: {status[p.key] ? "켜짐" : "꺼짐"}</span>
                ))}
                <button onClick={loadStatus}>새로고침</button>
            </div>
            <div className={"chat-menu"} onLoad={StartGoLive}>
                <button className={`chat-type all ${chatType=="all" ? "active" : ""}`} onClick={()=> setChatType("all")}>모두</button>
                <button className={`chat-type chzzk ${chatType=="chzzk" ? "active" : ""}`} onClick={()=> setChatType("chzzk")}>치지직</button>
                <button className={`chat-type soop ${chatType=="soop" ? "active" : ""}`} onClick={()=> setChatType("soop")}>숲</button>
                <button className={`chat-type weflab ${chatType=="weflab" ? "active" : ""}`} onClick={()=> setChatType("weflab")}>위플랩</button>
            </div>
            <div className={"chat"}>
                <Chat urls={alertPlatforms} chatType={chatType} onlyDonation={false}/>
            </div>
        </div>
    )
}