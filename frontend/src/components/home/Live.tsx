import {useState} from "react";

export default function HomeLive() {
    const [chatType, setChatType] = useState<string>("all")

    const platforms = [
        { key: "chzzk", label: "치지직" },
        { key: "soop", label: "숲"},
    ] as const

    return (
        <div className={"home-live"}>
            <div className={"live-status"}>
                {platforms.map((p)=> (
                    <span>{p.label} 방송 상태: </span>
                ))}
            </div>
            <div className={"chat-menu"}>
                <button className={"chat-type all"} onClick={()=> setChatType("all")}>모두</button>
                <button className={"chat-type chzzk"} onClick={()=> setChatType("chzzk")}>치지직</button>
                <button className={"chat-type soop"} onClick={()=> setChatType("soop")}>숲</button>
            </div>
            <div className={"chat"}></div>
        </div>
    )
}