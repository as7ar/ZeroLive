import '../assets/styles/page.css'
import '../assets/styles/util.css'
import {useState} from "react";
import RadioPage from "./utils/Radio";

export default function UtilPage() {
    const [tab, setTab] = useState<string | null>("radio")

    return (
        <div className="content">
            <div className="left-box">
                <div className={"menu-content"}>
                    {tab == "radio" && (<RadioPage/>)}
                </div>
            </div>
            <div className="right-box">
                <div className={"menu-selection"}>
                    <button className={tab == "general" ? "active" : ""} onClick={() => setTab("radio")}>라디오</button>
                </div>
            </div>
        </div>
    )
}