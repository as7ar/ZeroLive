import '../assets/styles/home.css'
import '../assets/styles/page.css'
import {useEffect, useState} from "react";
import {main} from "../../wailsjs/go/models";
import {GetSetting} from "../../wailsjs/go/main/App";
import HomeGeneral from "./home/General";
import HomeLive from "./home/Live";
import HomeDonation from "./home/Donation";

export default function HomePage() {
    const [settings, setSettings] = useState<main.Settings | null>(null)
    const [tab, setTab] = useState<string | null>("general")

    useEffect(() => {
        GetSetting().then((res) => {
            const s = main.Settings.createFrom(res)
            setSettings(s)
        })
    }, [])

    return (
        <div className="content">
            <div className="left-box">
                <div className={"menu-content"}>
                    {tab == "general" && (<HomeGeneral/>)}
                    {tab == "live" && (<HomeLive/>)}
                    {tab == "donation" && (<HomeDonation/>)}
                </div>
            </div>
            <div className="right-box">
                <div className={"menu-selection"}>
                    <button className={tab == "general" ? "active" : ""} onClick={() => setTab("general")}>일반</button>
                    <button className={tab == "live" ? "active" : ""} onClick={() => setTab("live")}>방송</button>
                    <button className={tab == "donation" ? "active" : ""} onClick={() => setTab("donation")}>후원</button>
                </div>
            </div>
        </div>
    )
}