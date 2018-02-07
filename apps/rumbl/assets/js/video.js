import Player from "./player"

let Video = {
  init(socket, element){
    if (!element) { return; }
    let playerId = element.getAttribute("data-player-id")
    let videoId = element.getAttribute("data-id")
    socket.connect()
    Player.init(element.id, playerId, () => {
      this.onReady(videoId, socket)
    })
  },
  onReady(videoId, socket){
    let msgContainer = document.getElementById("msg-container")
    let msgInput = document.getElementById("msg-input")
    let postButton = document.getElementById("msg-submit")
    let vidChannel = socket.channel("videos:" + videoId)

    msgInput.addEventListener("keypress", e => {
      var keyCode = e.which || e.keyCode
      if(keyCode == 13){
        e.preventDefault()
        this.postMessage(vidChannel, msgInput, Player.getCurrentTime())
      }
    })
    
    postButton.addEventListener("click", e => {
      this.postMessage(vidChannel, msgInput, Player.getCurrentTime())
    })

    vidChannel.on("new_annotation", (resp) => {
      vidChannel.params.last_seeen_id = resp.id
      this.renderAnnotation(msgContainer, resp)
    })

    msgContainer.addEventListener("click", e => {
      e.preventDefault();
      let seconds = e.target.getAttribute("data-seek") || e.target.parentNode.getAttribute("data-seek")
      if(!seconds){ return }
      Player.seekTo(seconds)
    })

    vidChannel.join()
      .receive("ok", resp => {
        let ids = resp.annotations.map(ann => ann.id)
        if(ids.length > 0){
          vidChannel.params.last_seen_id = Math.max(...ids)
        }
        this.scheduleMessages(msgContainer, resp.annotations)
      })
      .receive("error", reason => console.error("join failed", reason))
  },
  postMessage(vidChannel, msgInput, at){
    let payload = { body: msgInput.value, at: at }
    vidChannel.push("new_annotation", payload)
              .receive("error", e => console.error(e))
    msgInput.value = ""
  },
  esc(str){
    let div = document.createElement("div")
    div.appendChild(document.createTextNode(str))
    return div.innerHTML
  },
  renderAnnotation(msgContainer, {user, body, at}){
    let template = document.createElement("div")
    template.innerHTML = `
      <a href="#" data-seek="${this.esc(at)}">
        [${this.formatTime(at)}]
        <b>${this.esc(user.username)}</b>: ${this.esc(body)}
      </a>
    `
    msgContainer.appendChild(template)
    msgContainer.scrollTop = msgContainer.scrollHeight
  },
  scheduleMessages(msgContainer, annotations){
    setTimeout(() => {
      let ctime = Player.getCurrentTime()
      let remaining = this.renderAtTime(annotations, ctime, msgContainer)
      this.scheduleMessages(msgContainer, remaining)
    }, 1000)
  },
  renderAtTime(annotations, seconds, msgContainer){
    return annotations.filter(ann => {
      if(ann.at > seconds){
        return true
      }else{
        this.renderAnnotation(msgContainer, ann)
        return false
      }
    })
  },
  formatTime(at){
    let date = new Date(null)
    date.setSeconds(at / 1000)
    return date.toISOString().substr(14, 5)
  }
}

export default Video