import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './assets/styles/App.css'
import HomePage from "./components/Home";
import UtilPage from "./components/Util";
import {SettingPage} from "./components/Setting";

const tabs = ["기본", "유틸", "설정"]

function App() {
    const [active, setActive] = useState(0)
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
    const indicatorRef = useRef<HTMLDivElement>(null)

    const updateIndicator = (index: number) => {
        const tab = tabRefs.current[index]
        const indicator = indicatorRef.current
        if (!tab || !indicator) return

        indicator.style.width = `${tab.offsetWidth}px`
        indicator.style.transform = `translateX(${tab.offsetLeft}px)`
    }

    useLayoutEffect(() => {
        updateIndicator(active)
    }, [active])

    useEffect(() => {
        const handleResize = () => updateIndicator(active)
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const renderPage = () => {
        if (active === 0) return <HomePage />
        if (active === 1) return <UtilPage />
        return <SettingPage />
    }

    return (
        <div className="app">
            <div className="tabs">
                <ul className="pill-list">
                    {tabs.map((label, i) => (
                        <li key={label}>
                            <button
                                ref={(el) => (tabRefs.current[i] = el)}
                                className={`pill ${active === i ? "is-active" : ""}`}
                                onClick={() => setActive(i)}
                            >
                                {label}
                            </button>
                        </li>
                    ))}
                </ul>
                <div ref={indicatorRef} className="indicator" />
            </div>

            {renderPage()}
        </div>
    )
}

export default App