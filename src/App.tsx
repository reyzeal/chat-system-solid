import {createEffect, createSignal, For, Match, onMount, Show, Switch} from 'solid-js'
import './App.css'
import {createStore} from "solid-js/store";
import {Icon} from "@iconify-icon/solid"
interface Room {
    name: string
    id: number
    image_url: string
    participant: Record<string, any>[]
}
interface Comment {
    id: number
    type: string
    message: string
    sender: string
    attachments?: Record<string, any>[]
}
function getSourceParam() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("source");
}
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


function App() {
    const [data, setData] = createStore([] as {room: Room, comments: Comment[]}[])
    const [showSidebar, setShowSidebar] = createSignal(true);
    const [chats, setChats] = createSignal([] as Comment[])
    const [participants, setParticipants] = createSignal([] as Record<string, any>[])
    const [pov, setPov] = createSignal("")
    const [selected, setSelected] = createSignal(-1)
    const [room, setRoom] = createSignal({} as Room)
    const [source, setSource] = createSignal(getSourceParam() || "/chat_response.json")
    const [detailOpen, setDetailOpen] = createSignal(false);
    // const [hash, setHash] = createSignal("")
    onMount(() => {
        fetch(source())
            .then(res => res.json())
        .then(data => {
            const payload = data.results as {room: Room, comments: Comment[]}[]
            setData(payload)
            setSelected(payload[0].room.id)
            setRoom(payload[0].room)
            // setHash(JSON.stringify(payload[0]))
        })
    })
    createEffect(() => {
        if (selected) {
            let select_chat = data.filter(x => x.room.id === selected())?.pop()
            if (select_chat) {
                setChats(select_chat.comments)
                setParticipants(select_chat.room.participant.map((x,i) => {
                    let temp = {...x}
                    temp.avatar = `https://picsum.photos/id/${200+i}/100`
                    return temp
                }))
                setRoom(select_chat.room)
                if(!pov().length){
                    setPov(select_chat.room.participant[select_chat.room.participant.length-1].id)
                }

                // setHash(JSON.stringify(select_chat))
                setShowSidebar(false)
            }
        }
    })
    createEffect(() => {
        fetch(source())
            .then(res => res.json())
            .then(data => {
                const payload = data.results as {room: Room, comments: Comment[]}[]
                setData(payload)
                setSelected(payload[0].room.id)
                setRoom(payload[0].room)
                // setHash(JSON.stringify(payload[0]))
            })
    })
    const getSenderName = (id : string)=> {
        const sender = participants().find(x => x.id === id)
        return sender ? sender.name : ""
    }
    const getSenderAvatar = (id : string)=> {
        const sender = participants().find(x => x.id === id)
        return sender ? sender.avatar : ""
    }

  return (
    <div class="flex flex-row min-h-screen mx-5 bg-white">
        <section  class={`fixed inset-y-0 left-0 z-40 bg-gray-100 w-2/3 sm:w-1/2 md:static md:z-0 md:flex md:w-1/3 flex-col min-h-screen px-2 py-3 border-r border-gray-200 transition-transform transform ${
            showSidebar() ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 h-screen`}>

            <div class={"text-2xl font-bold my-4 mx-2 flex justify-between"}>
                <p>Chats</p>
                <div class="md:hidden flex justify-end px-2 mb-2">
                    <button onClick={() => setShowSidebar(false)} class="text-gray-500 text-xl">✕</button>
                </div>
            </div>
            <div class={"overflow-y-auto flex-1"}>
                <For each={data}>
                    {({room, comments}) => <div class={`flex cursor-pointer border-y ${room.id == selected()?"bg-blue-500 text-white rounded-xl":""} border-gray-200 flex-row gap-2 p-2`}
                                                onClick={() => {
                                                    setSelected(room.id);
                                                    console.log(room.id)
                                                }}>
                        <div>
                            <div style={{
                                "background-image": `url(${room.image_url})`,
                                "background-size": "cover",
                                "background-repeat": "no-repeat",
                                "background-position": "center",
                            }} class={`w-[50px] h-[50px] rounded-full overflow-hidden`}/>
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg">{room.name}</h3>
                            <p class="line-clamp-1">{comments[comments.length-1].message}</p>
                        </div>
                    </div>}
                </For>
            </div>
            <div class={"absolute bottom-10 flex flex-row gap-2 justify-center items-center p-2 w-full"}>
                <p>Case</p>
                <select class={"border rounded border-gray-400 p-2 flex-1 mr-2"} onchange={(e) => setSource(e.target.value || "")}>
                    <option selected={source().endsWith("chat_response.json")} value={"/chat_response.json"}>chat_response.json</option>
                    <option selected={source().endsWith("chat_modified.json")} value={"/chat_modified.json"}>chat_modified.json</option>
                    <option selected={source().endsWith("chat_extended.json")} value={"/chat_extended.json"}>chat_extended.json</option>
                </select>
            </div>
        </section>
        <section class="w-full md:w-2/3 flex flex-col space-y-3 mx-auto h-screen">
            {participants().length > 0 &&
            <>

                <div class={"py-4 md:px-5 flex flex-row space-x-2 drop-shadow-sm drop-shadow-gray-400 bg-white border-b border-gray-200"}>
                    <button
                        onClick={() => setShowSidebar(true)}
                        class="md:hidden z-20 top-4 left-4 z-50 bg-white text-gray-800 p-2 rounded"
                    >
                        ☰
                    </button>
                    <div style={{
                        "background-image": `url(${room().image_url})`,
                        "background-size": "cover",
                        "background-repeat": "no-repeat",
                        "background-position": "center",
                    }} class={`w-[50px] h-[50px] rounded-full overflow-hidden cursor-pointer`} onclick={() => {
                        setDetailOpen(true)
                    }}/>
                    <div class="cursor-pointer" onclick={() => {
                        setDetailOpen(true)
                    }}>
                        <h1 class={"text-xl font-semibold"}>{room().name}</h1>
                        <p class="line-clamp-1 text-gray-600">
                            {participants().map(x => x.name).join(', ')}
                        </p>
                    </div>

                    <div class="text-gray-600 hover:text-black text-xl p-2 ml-auto cursor-pointer" onclick={() => {
                        setDetailOpen(true)
                    }}>
                        ⋮
                    </div>

                </div>
                <div class="flex flex-col space-y-3 mx-5 overflow-y-auto flex-1">
                    <For each={chats()}>
                        {(comment) => <div class={ pov() != comment.sender?
                            "bg-gray-200 max-w-xs p-4 rounded-lg rounded-tl-none self-start animate-slide-in":
                            "bg-blue-500 text-white max-w-xs p-4 rounded-lg rounded-tr-none self-end animate-slide-in delay-100"
                        }>

                            <div class={"font-semibold mb-2 flex flex-row space-x-2 items-center border-b border-gray-300 pb-2"}>
                                <img
                                    width={100}
                                    src={getSenderAvatar(comment.sender)}
                                    class="w-8 h-8 rounded-full object-cover"
                                />
                                <p>{getSenderName(comment.sender)}</p>
                            </div>
                            <p>{comment.message}</p>
                            <Show when={comment.type === "attachments" && comment.attachments}>
                                <p class={`text-sm py-2 `+(pov() === comment.sender?"text-gray-200":"text-gray-600")}>{comment.attachments?.length} attachments</p>
                                <hr class={"mb-4 "+(pov() === comment.sender?"text-gray-200":"text-gray-600")} />
                                <For each={comment.attachments} fallback={<></>}>
                                    {attachment => <>
                                        <Switch>
                                            <Match when={attachment.type === "image"}>
                                                <a href={attachment.url} target="_blank">
                                                    <img src={attachment.url} alt="" class="mb-2 cursor-pointer" />
                                                </a>
                                            </Match>
                                            <Match when={attachment.type === "pdf"}>
                                                <a href={attachment.url} target="_blank">
                                                    <div class={`p-5 cursor-pointer hover:bg-${pov() != comment.sender?"gray":"blue"}-500 text-gray-600 hover:text-white text-center flex flex-col items-center`}>
                                                        <img src={"/PDF_file_icon.svg.png"} width={75} alt=""/>
                                                        <p class={""}>{attachment.path.split("/").pop()}</p>
                                                        <p>({formatBytes(attachment.size)})</p>
                                                    </div>
                                                </a>
                                            </Match>
                                            <Match when={attachment.type === "video"}>
                                                <a href={attachment.url} target="_blank" class={"bg-white rounded-lg drop-shadow-gray-400 block mb-2"}>
                                                    <div class={`p-5 cursor-pointer hover:bg-${pov() != comment.sender?"gray":"blue"}-500 text-gray-600 hover:text-white text-center flex flex-col items-center`}>
                                                        <video controls width="320" class="rounded-lg shadow-md">
                                                            <source src={attachment.url} type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                        <p class={""}>{attachment.path.split("/").pop()}</p>
                                                        <p>({formatBytes(attachment.size)})</p>
                                                    </div>
                                                </a>
                                            </Match>
                                        </Switch>
                                    </> }
                                </For>
                            </Show>
                        </div>}
                    </For>
                </div>
                <div class={"mt-auto"}>
                    <form class="mx-4 mb-5 flex items-center space-x-2" onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.target as HTMLFormElement;
                        const formdata = new FormData(input);
                        const chat = formdata.get("chat")
                        if(input && chat && chat.toString().length) {

                            for(let i in data) {
                                if(data[i].room.id === selected()){
                                    setData(
                                        (x) => x.room.id === selected(),
                                        "comments",
                                        [...data[i].comments, {
                                            id: Math.round(Math.random()*100000),
                                            type: "text",
                                            message: chat?.toString().trim() || "",
                                            sender: pov()
                                        }]
                                    )
                                }
                            }
                            input.reset();
                        }
                    }}>
                        <input id={"chat"} name={"chat"} type="text" class="w-full rounded-3xl border-2 border-gray-500 p-2" placeholder={"Type to chat"}/>
                        <button type="submit">
                            <Icon icon="material-symbols-light:send" width="40" height="40" />
                        </button>
                    </form>
                    <div class="bg-gray-500 text-white p-2">POV as :<select class="ml-5" onchange={e => setPov(e.target.value)}>
                        <For each={participants()}>
                            {(p) => <option selected={p.id === pov()} value={p.id}>{p.name}</option>}
                        </For>
                    </select></div>
                </div>

            </>}
        </section>

        <Show when={detailOpen()}>
            <div class="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-xl shadow-xl max-w-sm md:max-w-md w-full p-6 relative">
                    <button
                        class="absolute top-2 right-2 text-gray-500 hover:text-black"
                        onClick={() => setDetailOpen(false)}
                    >
                        ✖
                    </button>

                    <div class="flex items-center gap-4 mb-4">
                        <img
                            src={room().image_url}
                            alt="Room"
                            class="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <p class="font-bold text-lg">{room().name}</p>
                            <p class="text-sm text-gray-500">ID: {room().id}</p>
                        </div>
                    </div>

                    <div>
                        <p class="font-semibold mb-2">Participants</p>
                        <ul class="space-y-2 max-h-48 overflow-y-auto pr-2">
                            <For each={participants()}>
                                {(user) => (
                                    <li class="flex items-center gap-3">
                                        <img
                                            width={100}
                                            src={user.avatar}
                                            class="w-8 h-8 rounded-full object-cover"
                                        />
                                        <span>{user.name} - {user.id}</span>
                                    </li>
                                )}
                            </For>
                        </ul>
                    </div>
                </div>
            </div>
        </Show>
    </div>
  )
}

export default App
