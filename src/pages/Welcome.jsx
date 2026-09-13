import { useEffect, useRef, useState } from "react";
import SkylineScene from "../components/SkylineScene.jsx";
import DesktopIcon from "../components/desktop/DesktopIcon.jsx";
import DesktopFolder from "../components/desktop/DesktopFolder.jsx";
import FolderView from "../components/desktop/FolderView.jsx";
import BackgroundPicker from "../components/BackgroundPicker.jsx";
import AppWindow from "../components/desktop/AppWindow.jsx";
import Taskbar from "../components/desktop/Taskbar.jsx";
import ClockWidget from "../components/desktop/ClockWidget.jsx";
import WeatherWidget from "../components/desktop/WeatherWidget.jsx";
import StickyNoteWidget from "../components/desktop/StickyNoteWidget.jsx";
import TimerStopwatchWidget from "../components/desktop/TimerStopwatchWidget.jsx";
import BatteryWidget from "../components/desktop/BatteryWidget.jsx";
import DesktopContextMenu from "../components/desktop/DesktopContextMenu.jsx";
import StartMenu from "../components/desktop/StartMenu.jsx";
import BootScreen from "../components/desktop/BootScreen.jsx";
import NotesApp from "../apps/NotesApp.jsx";
import TodoApp from "../apps/TodoApp.jsx";
import CalculatorApp from "../apps/CalculatorApp.jsx";
import CalendarApp from "../apps/CalendarApp.jsx";
import TimerStopwatchApp from "../apps/TimerStopwatchApp.jsx";
import UnitConverterApp from "../apps/UnitConverterApp.jsx";
import MusicPlayerApp from "../apps/MusicPlayerApp.jsx";
import WeatherApp from "../apps/WeatherApp.jsx";
import PreferencesApp from "../apps/PreferencesApp.jsx";
import FileManagerApp from "../apps/FileManagerApp.jsx";
import RecycleBinApp from "../apps/RecycleBinApp.jsx";
import MemoryGame from "../components/MemoryGame.jsx";
import Game2048 from "../components/Game2048.jsx";
import TicTacToe from "../components/TicTacToe.jsx";
import SnakeGame from "../components/SnakeGame.jsx";
import { useSound } from "../hooks/useSound.js";
import { getDesktopSettings } from "../desktopSettings.js";
import { TRIGGER_SEQUENCE } from "../config.js";

const APPS = [
    { type: "notes", icon: "📝", title: "Notes", width: 480, height: 420, component: NotesApp },
    { type: "todo", icon: "✅", title: "To-Do", width: 360, height: 460, component: TodoApp },
    { type: "calculator", icon: "🧮", title: "Calculator", width: 300, height: 440, component: CalculatorApp },
    { type: "calendar", icon: "📅", title: "Calendar", width: 340, height: 480, component: CalendarApp },
    { type: "timerstopwatch", icon: "⏱", title: "Timer", width: 320, height: 340, component: TimerStopwatchApp },
    { type: "converter", icon: "🔁", title: "Converter", width: 340, height: 380, component: UnitConverterApp },
    { type: "music", icon: "🎵", title: "Music", width: 360, height: 440, component: MusicPlayerApp },
    { type: "weather", icon: "🌦", title: "Weather", width: 340, height: 420, component: WeatherApp },
    { type: "preferences", icon: "⚙️", title: "Preferences", width: 340, height: 380, component: PreferencesApp },
    { type: "filemanager", icon: "🗂", title: "Files", width: 420, height: 460, component: FileManagerApp },
    { type: "recyclebin", icon: "🗑", title: "Recycle Bin", width: 360, height: 420, component: RecycleBinApp },
    { type: "memory", icon: "🃏", title: "Memory", width: 360, height: 420, component: function () { return <MemoryGame onBack={function () { }} />; } },
    { type: "2048", icon: "🔢", title: "2048", width: 360, height: 460, component: function () { return <Game2048 onBack={function () { }} />; } },
    { type: "tictactoe", icon: "✕⭕", title: "Tic-Tac-Toe", width: 340, height: 400, component: function () { return <TicTacToe onBack={function () { }} />; } },
    { type: "snake", icon: "🐍", title: "Snake", width: 340, height: 440, component: function () { return <SnakeGame onBack={function () { }} />; } }
];

const APP_ICONS = {};
APPS.forEach(function (a) { APP_ICONS[a.type] = a.icon; });

const GRID_SIZE = 84;
const ORIGIN = { x: 24, y: 24 };
const DROP_THRESHOLD = 50;

function defaultFolders() {
    return [
        {
            id: "games",
            name: "Games",
            x: 24,
            y: 24 + 5 * GRID_SIZE,
            items: ["memory", "2048", "tictactoe", "snake"]
        }
    ];
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 768);
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isMobile;
}

export default function Welcome({ onUnlock }) {
    const isMobile = useIsMobile();
    const [windows, setWindows] = useState([]);
    const nextZ = useRef(10);

    const [bootDone, setBootDone] = useState(function () {
        return sessionStorage.getItem("bootDone") === "true";
    });

    const [folders, setFolders] = useState(function () {
        try {
            const saved = localStorage.getItem("desktopFolders");
            return saved ? JSON.parse(saved) : defaultFolders();
        } catch (err) {
            return defaultFolders();
        }
    });
    const [openFolder, setOpenFolder] = useState(null);
    const [folderOrigin, setFolderOrigin] = useState("50% 50%");

    const groupedTypes = new Set();
    folders.forEach(function (f) {
        f.items.forEach(function (item) { groupedTypes.add(item); });
    });

    const [iconPositions, setIconPositions] = useState(function () {
        try {
            const saved = localStorage.getItem("desktopIconPositions");
            return saved ? JSON.parse(saved) : {};
        } catch (err) {
            return {};
        }
    });
    const [dragHoverTarget, setDragHoverTarget] = useState(null);

    const [background, setBackground] = useState(function () {
        try {
            const saved = localStorage.getItem("desktopBackground");
            return saved ? JSON.parse(saved) : null;
        } catch (err) {
            return null;
        }
    });
    const [showBgPicker, setShowBgPicker] = useState(false);

    const [widgetPositions, setWidgetPositions] = useState(function () {
        try {
            const saved = localStorage.getItem("desktopWidgetPositions");
            return saved
                ? JSON.parse(saved)
                : {
                    clock: { x: 24, y: 500 },
                    weather: { x: 180, y: 500 },
                    sticky: { x: 340, y: 500 },
                    timerstopwatch: { x: 500, y: 500 },
                    battery: { x: 660, y: 500 }
                };
        } catch (err) {
            return {};
        }
    });

    const [contextMenu, setContextMenu] = useState(null);
    const [showStartMenu, setShowStartMenu] = useState(false);
    const [desktopSettings, setDesktopSettings] = useState(getDesktopSettings());
    const [customIconNames, setCustomIconNames] = useState(function () {
        try {
            const saved = localStorage.getItem("desktopIconNames");
            return saved ? JSON.parse(saved) : {};
        } catch (err) {
            return {};
        }
    });
    const [snappedWindows, setSnappedWindows] = useState({});
    const soundHooks = useSound();
    const playClick = soundHooks.playClick;
    const playOpen = soundHooks.playOpen;

    const [promptVisible, setPromptVisible] = useState(false);
    const [blindValue, setBlindValue] = useState("");
    const blindInputRef = useRef(null);

    useEffect(function () {
        blindInputRef.current && blindInputRef.current.focus();
    }, [promptVisible]);

    useEffect(function () {
        function handleSettingsChange(e) {
            setDesktopSettings(e.detail);
        }
        window.addEventListener("desktopSettingsChanged", handleSettingsChange);
        return function () {
            window.removeEventListener("desktopSettingsChanged", handleSettingsChange);
        };
    }, []);

    function completeBoot() {
        sessionStorage.setItem("bootDone", "true");
        setBootDone(true);
    }

    function handleBlindChange(e) {
        const v = e.target.value;
        setBlindValue(v);
        if (!promptVisible && v.endsWith(TRIGGER_SEQUENCE)) {
            setPromptVisible(true);
            setBlindValue("");
        }
    }

    async function handleBlindKeyDown(e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const typed = blindValue.trim();
        setBlindValue("");
        if (!typed) return;
        await onUnlock(typed);
        blindInputRef.current && blindInputRef.current.focus();
    }

    function focusCatcher() {
        if (!promptVisible) blindInputRef.current && blindInputRef.current.focus();
    }

    function persistFolders(next) {
        setFolders(next);
        try {
            localStorage.setItem("desktopFolders", JSON.stringify(next));
        } catch (err) {
            // ignore storage errors
        }
    }

    function persistIconPositions(next) {
        setIconPositions(next);
        try {
            localStorage.setItem("desktopIconPositions", JSON.stringify(next));
        } catch (err) {
            // ignore storage errors
        }
    }

    function moveWidget(key, x, y, commit) {
        setWidgetPositions(function (prev) {
            const next = Object.assign({}, prev);
            next[key] = { x: x, y: y };
            if (commit) {
                try {
                    localStorage.setItem("desktopWidgetPositions", JSON.stringify(next));
                } catch (err) {
                    // ignore
                }
            }
            return next;
        });
    }

    function toGridCoords(x, y) {
        return {
            gx: Math.max(0, Math.round((x - ORIGIN.x) / GRID_SIZE)),
            gy: Math.max(0, Math.round((y - ORIGIN.y) / GRID_SIZE))
        };
    }
    function toPixelCoords(gx, gy) {
        return { x: ORIGIN.x + gx * GRID_SIZE, y: ORIGIN.y + gy * GRID_SIZE };
    }

    function getIconPos(type, index) {
        if (iconPositions[type]) return iconPositions[type];
        const col = Math.floor(index / 6);
        const row = index % 6;
        return toPixelCoords(col, row);
    }

    const ungroupedApps = APPS.filter(function (a) { return !groupedTypes.has(a.type); });

    function allOccupiedCenters(excludeKey) {
        const list = [];
        ungroupedApps.forEach(function (app, i) {
            const key = "app:" + app.type;
            if (key === excludeKey) return;
            const pos = getIconPos(app.type, i);
            list.push({ key: key, x: pos.x + 40, y: pos.y + 40 });
        });
        folders.forEach(function (f) {
            const key = "folder:" + f.id;
            if (key === excludeKey) return;
            list.push({ key: key, x: f.x + 40, y: f.y + 40 });
        });
        return list;
    }

    function findFreeCell(x, y, excludeKey) {
        const occupied = new Set();
        ungroupedApps.forEach(function (app, i) {
            if ("app:" + app.type === excludeKey) return;
            const pos = getIconPos(app.type, i);
            const g = toGridCoords(pos.x, pos.y);
            occupied.add(g.gx + "," + g.gy);
        });
        folders.forEach(function (f) {
            if ("folder:" + f.id === excludeKey) return;
            const g = toGridCoords(f.x, f.y);
            occupied.add(g.gx + "," + g.gy);
        });

        const start = toGridCoords(x, y);
        const startKey = start.gx + "," + start.gy;
        if (!occupied.has(startKey)) return toPixelCoords(start.gx, start.gy);

        for (let radius = 1; radius < 30; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
                    const gx = start.gx + dx;
                    const gy = start.gy + dy;
                    if (gx < 0 || gy < 0) continue;
                    const key = gx + "," + gy;
                    if (!occupied.has(key)) return toPixelCoords(gx, gy);
                }
            }
        }
        return toPixelCoords(start.gx, start.gy);
    }

    function checkHover(selfKey, x, y) {
        const center = { x: x + 40, y: y + 40 };
        const targets = allOccupiedCenters(selfKey);
        for (let i = 0; i < targets.length; i++) {
            const t = targets[i];
            const dist = Math.hypot(center.x - t.x, center.y - t.y);
            if (dist < DROP_THRESHOLD) return t.key;
        }
        return null;
    }

    function handleAppMove(type, x, y, commit) {
        const selfKey = "app:" + type;

        if (!commit) {
            setIconPositions(function (prev) {
                const next = Object.assign({}, prev);
                next[type] = { x: x, y: y };
                return next;
            });
            setDragHoverTarget(checkHover(selfKey, x, y));
            return;
        }

        const target = checkHover(selfKey, x, y);
        setDragHoverTarget(null);

        if (target && target.indexOf("folder:") === 0) {
            const folderId = target.slice(7);
            const next = folders.map(function (f) {
                if (f.id === folderId && f.items.indexOf(type) === -1) {
                    return Object.assign({}, f, { items: f.items.concat([type]) });
                }
                return f;
            });
            persistFolders(next);
            const rest = Object.assign({}, iconPositions);
            delete rest[type];
            persistIconPositions(rest);
            return;
        }

        if (target && target.indexOf("app:") === 0) {
            const otherType = target.slice(4);
            const newFolder = {
                id: "folder-" + Date.now(),
                name: "New Folder",
                x: (iconPositions[otherType] && iconPositions[otherType].x) || x,
                y: (iconPositions[otherType] && iconPositions[otherType].y) || y,
                items: [otherType, type]
            };
            persistFolders(folders.concat([newFolder]));
            const rest = Object.assign({}, iconPositions);
            delete rest[type];
            delete rest[otherType];
            persistIconPositions(rest);
            return;
        }

        const freeCell = findFreeCell(x, y, selfKey);
        const next = Object.assign({}, iconPositions);
        next[type] = freeCell;
        persistIconPositions(next);
    }

    function handleFolderMove(folderId, x, y, commit) {
        const selfKey = "folder:" + folderId;

        if (!commit) {
            setFolders(function (prev) {
                return prev.map(function (f) {
                    return f.id === folderId ? Object.assign({}, f, { x: x, y: y }) : f;
                });
            });
            setDragHoverTarget(checkHover(selfKey, x, y));
            return;
        }

        const target = checkHover(selfKey, x, y);
        setDragHoverTarget(null);

        if (target && target.indexOf("folder:") === 0) {
            const otherId = target.slice(7);
            const movingFolder = folders.filter(function (f) { return f.id === folderId; })[0];
            const next = folders
                .filter(function (f) { return f.id !== folderId; })
                .map(function (f) {
                    if (f.id === otherId) {
                        const merged = Array.from(new Set(f.items.concat(movingFolder.items)));
                        return Object.assign({}, f, { items: merged });
                    }
                    return f;
                });
            persistFolders(next);
            return;
        }

        if (target && target.indexOf("app:") === 0) {
            const appType = target.slice(4);
            const next = folders.map(function (f) {
                if (f.id === folderId && f.items.indexOf(appType) === -1) {
                    return Object.assign({}, f, { items: f.items.concat([appType]) });
                }
                return f;
            });
            persistFolders(next);
            const rest = Object.assign({}, iconPositions);
            delete rest[appType];
            persistIconPositions(rest);
            return;
        }

        const freeCell = findFreeCell(x, y, selfKey);
        const next = folders.map(function (f) {
            return f.id === folderId ? Object.assign({}, f, { x: freeCell.x, y: freeCell.y }) : f;
        });
        persistFolders(next);
    }

    function openFolderView(folder, e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const originX = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
        const originY = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
        setFolderOrigin(originX + "% " + originY + "%");
        setOpenFolder(folder.id);
    }

    function removeFromFolder(folderId, type) {
        const folder = folders.filter(function (f) { return f.id === folderId; })[0];
        const remainingItems = folder.items.filter(function (t) { return t !== type; });

        if (remainingItems.length === 0) {
            persistFolders(folders.filter(function (f) { return f.id !== folderId; }));
            setOpenFolder(null);
        } else {
            const next = folders.map(function (f) {
                return f.id === folderId ? Object.assign({}, f, { items: remainingItems }) : f;
            });
            persistFolders(next);
        }

        const freeCell = findFreeCell(folder.x, folder.y, null);
        const next = Object.assign({}, iconPositions);
        next[type] = freeCell;
        persistIconPositions(next);
    }

    function selectPresetBackground(id) {
        const next = { type: "preset", value: id };
        setBackground(next);
        localStorage.setItem("desktopBackground", JSON.stringify(next));
    }
    function uploadBackgroundImage(dataUrl) {
        const next = { type: "image", value: dataUrl };
        setBackground(next);
        try {
            localStorage.setItem("desktopBackground", JSON.stringify(next));
        } catch (err) {
            // may exceed localStorage size limit for large images
        }
    }

    function handleDesktopContextMenu(e) {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    }

    function handleNewFolderFromMenu() {
        const name = prompt("Folder name:") || "New Folder";
        const newFolder = {
            id: "folder-" + Date.now(),
            name: name,
            x: (contextMenu && contextMenu.x) || 100,
            y: (contextMenu && contextMenu.y) || 100,
            items: []
        };
        persistFolders(folders.concat([newFolder]));
    }

    function handleSortIcons() {
        const next = {};
        ungroupedApps.forEach(function (app, i) {
            next[app.type] = toPixelCoords(Math.floor(i / 6), i % 6);
        });
        persistIconPositions(next);
    }

    function renameIcon(type, newName) {
        const next = Object.assign({}, customIconNames);
        next[type] = newName;
        setCustomIconNames(next);
        localStorage.setItem("desktopIconNames", JSON.stringify(next));
    }

    function handleSnapWindow(id, edge) {
        setSnappedWindows(function (prev) {
            const next = Object.assign({}, prev);
            next[id] = edge;
            return next;
        });
    }

    function openApp(type) {
        playOpen();
        setWindows(function (prev) {
            const existing = prev.filter(function (w) { return w.type === type; })[0];
            if (existing) {
                nextZ.current += 1;
                return prev.map(function (w) {
                    return w.type === type ? Object.assign({}, w, { minimized: false, z: nextZ.current }) : w;
                });
            }
            const appDef = APPS.filter(function (a) { return a.type === type; })[0];
            nextZ.current += 1;
            const offset = prev.length * 24;
            return prev.concat([{
                id: type + "-" + Date.now(),
                type: type,
                title: appDef.title,
                icon: appDef.icon,
                x: 120 + offset,
                y: 80 + offset,
                z: nextZ.current,
                minimized: false
            }]);
        });
    }

    function closeWindow(id) {
        setWindows(function (prev) { return prev.filter(function (w) { return w.id !== id; }); });
    }
    function minimizeWindow(id) {
        setWindows(function (prev) {
            return prev.map(function (w) { return w.id === id ? Object.assign({}, w, { minimized: true }) : w; });
        });
    }
    function restoreWindow(id) {
        nextZ.current += 1;
        setWindows(function (prev) {
            return prev.map(function (w) {
                return w.id === id ? Object.assign({}, w, { minimized: !w.minimized, z: nextZ.current }) : w;
            });
        });
    }
    function focusWindow(id) {
        nextZ.current += 1;
        setWindows(function (prev) {
            return prev.map(function (w) { return w.id === id ? Object.assign({}, w, { z: nextZ.current }) : w; });
        });
    }
    function dragWindow(id, dx, dy) {
        setWindows(function (prev) {
            return prev.map(function (w) {
                return w.id === id ? Object.assign({}, w, { x: w.x + dx, y: w.y + dy }) : w;
            });
        });
    }

    const activeFolder = folders.filter(function (f) { return f.id === openFolder; })[0];

    if (isMobile) {
        return (
            <div className="relative h-screen overflow-hidden" onClick={focusCatcher}>
                <SkylineScene background={background} />
                <input
                    ref={blindInputRef}
                    type="text"
                    value={blindValue}
                    onChange={handleBlindChange}
                    onKeyDown={handleBlindKeyDown}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className={
                        promptVisible
                            ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 text-center px-4 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white text-sm tracking-wide outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-xl z-30 scale-in"
                            : "fixed inset-0 opacity-0 z-0"
                    }
                    style={{ fontSize: "16px" }}
                />
            </div>
        );
    }

    
    if (!bootDone) {
        return <BootScreen onDone={completeBoot} />;
    }

    return (
        <div
            className="relative h-screen overflow-hidden"
            onClick={focusCatcher}
            onContextMenu={handleDesktopContextMenu}
        >
            <SkylineScene background={background} />

            {showBgPicker && (
                <BackgroundPicker
                    current={background}
                    onSelectPreset={function (id) {
                        selectPresetBackground(id);
                        setShowBgPicker(false);
                    }}
                    onUploadImage={function (dataUrl) {
                        uploadBackgroundImage(dataUrl);
                        setShowBgPicker(false);
                    }}
                    onClose={function () { setShowBgPicker(false); }}
                />
            )}

            <input
                ref={blindInputRef}
                type="text"
                value={blindValue}
                onChange={handleBlindChange}
                onKeyDown={handleBlindKeyDown}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                className={
                    promptVisible
                        ? "fixed top-8 left-1/2 -translate-x-1/2 w-64 text-center px-4 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white text-sm tracking-wide outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-xl z-50 scale-in"
                        : "fixed inset-0 opacity-0 z-0 pointer-events-none"
                }
                style={{ fontSize: "16px" }}
            />

            <ClockWidget
                x={widgetPositions.clock ? widgetPositions.clock.x : 24}
                y={widgetPositions.clock ? widgetPositions.clock.y : 500}
                onMove={function (x, y, c) { moveWidget("clock", x, y, c); }}
            />
            <WeatherWidget
                x={widgetPositions.weather ? widgetPositions.weather.x : 180}
                y={widgetPositions.weather ? widgetPositions.weather.y : 500}
                onMove={function (x, y, c) { moveWidget("weather", x, y, c); }}
            />
            <StickyNoteWidget
                x={widgetPositions.sticky ? widgetPositions.sticky.x : 340}
                y={widgetPositions.sticky ? widgetPositions.sticky.y : 500}
                onMove={function (x, y, c) { moveWidget("sticky", x, y, c); }}
            />
            <TimerStopwatchWidget
                x={widgetPositions.timerstopwatch ? widgetPositions.timerstopwatch.x : 500}
                y={widgetPositions.timerstopwatch ? widgetPositions.timerstopwatch.y : 500}
                onMove={function (x, y, c) { moveWidget("timerstopwatch", x, y, c); }}
            />
            <BatteryWidget
                x={widgetPositions.battery ? widgetPositions.battery.x : 660}
                y={widgetPositions.battery ? widgetPositions.battery.y : 500}
                onMove={function (x, y, c) { moveWidget("battery", x, y, c); }}
            />

            {ungroupedApps.map(function (app, i) {
                const pos = getIconPos(app.type, i);
                return (
                    <DesktopIcon
                        key={app.type}
                        icon={app.icon}
                        label={customIconNames[app.type] || app.title}
                        x={pos.x}
                        y={pos.y}
                        scale={desktopSettings.iconScale}
                        selected={dragHoverTarget === "app:" + app.type}
                        onSelect={function () { }}
                        onMove={function (x, y, commit) { handleAppMove(app.type, x, y, commit); }}
                        onOpen={function () { openApp(app.type); }}
                        onRename={function (newName) { renameIcon(app.type, newName); }}
                    />
                );
            })}

            {folders.map(function (folder) {
                return (
                    <DesktopFolder
                        key={folder.id}
                        folder={folder}
                        appIcons={APP_ICONS}
                        isDropTarget={dragHoverTarget === "folder:" + folder.id}
                        onOpen={function (e) { openFolderView(folder, e); }}
                        onMove={function (x, y, commit) { handleFolderMove(folder.id, x, y, commit); }}
                    />
                );
            })}

            {activeFolder && (
                <FolderView
                    folder={activeFolder}
                    apps={APPS}
                    origin={folderOrigin}
                    onClose={function () { setOpenFolder(null); }}
                    onOpenApp={function (type) {
                        openApp(type);
                        setOpenFolder(null);
                    }}
                    onRemoveItem={function (type) { removeFromFolder(activeFolder.id, type); }}
                />
            )}

            {windows
                .filter(function (w) { return !w.minimized; })
                .map(function (w) {
                    const appDef = APPS.filter(function (a) { return a.type === w.type; })[0];
                    const Comp = appDef.component;
                    return (
                        <AppWindow
                            key={w.id}
                            title={w.title}
                            icon={w.icon}
                            x={w.x}
                            y={w.y}
                            zIndex={w.z}
                            width={appDef.width}
                            height={appDef.height}
                            snapped={snappedWindows[w.id]}
                            onSnap={function (edge) { handleSnapWindow(w.id, edge); }}
                            onClose={function () { closeWindow(w.id); }}
                            onMinimize={function () { minimizeWindow(w.id); }}
                            onFocus={function () { focusWindow(w.id); }}
                            onDragDelta={function (dx, dy) { dragWindow(w.id, dx, dy); }}
                        >
                            <Comp />
                        </AppWindow>
                    );
                })}

            {contextMenu && (
                <DesktopContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onNewFolder={handleNewFolderFromMenu}
                    onChangeBackground={function () { setShowBgPicker(true); }}
                    onSortIcons={handleSortIcons}
                    onClose={function () { setContextMenu(null); }}
                />
            )}

            {showStartMenu && (
                <StartMenu
                    apps={APPS}
                    folders={folders}
                    onOpenApp={openApp}
                    onOpenFolder={function (f) { setOpenFolder(f.id); }}
                    onClose={function () { setShowStartMenu(false); }}
                />
            )}

            <Taskbar
                windows={windows}
                onRestore={restoreWindow}
                onStartClick={function () { setShowStartMenu(function (s) { return !s; }); }}
                accent={desktopSettings.accent}
            />
        </div>
    );
}