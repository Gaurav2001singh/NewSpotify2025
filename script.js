console.log("Welcome to spotify")

let currentSong = new Audio;

let currentIndex = null;

let currFolder

let songs;

let lastPlayedTrack = null;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remaningSeconds = Math.floor(seconds % 60);

    const formatMinutes = String(minutes).padStart(2, '0');
    const formatSeconds = String(remaningSeconds).padStart(2, '0');

    return `${formatMinutes}:${formatSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }
    }

    let songUl = document.querySelector(".songList").getElementsByTagName('ul')[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${decodeURI(song).replaceAll("%20", "\t")}</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img class="invert play-icon" src="img/play.svg" alt="">
                            </div></li>`;
    }
    // Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    //     // e.addEventListener("click", element => {
    //     //     console.log(element);
    //     // })

    // })

    document.querySelectorAll(".play-icon").forEach((icon, index) => {
    icon.isPlaying = false;

    icon.addEventListener("click", (e) => {
        e.stopPropagation();

        const songName = decodeURI(songs[index]);

        if (icon.isPlaying) {
            currentSong.pause();
            currentSong.currentTime = 0;
            icon.src = "img/play.svg";
            icon.isPlaying = false;
            currentIndex = null;
            return;
        }

    
        if (currentIndex !== null && currentIndex !== index) {
            const prevIcon = document.querySelectorAll(".play-icon")[currentIndex];
            prevIcon.src = "img/play.svg";
            prevIcon.isPlaying = false;
        }

        playMusic(songName, false, true);
        icon.src = "img/pause.svg";
        icon.isPlaying = true;
        currentIndex = index;

        
        currentSong.onended = () => {
            icon.src = "img/play.svg";
            icon.isPlaying = false;
            currentIndex = null;
        };
    });
});


    return songs
}

const playMusic = (track, pause = false, shouldReplace = true) => {

    if (!track) {
        document.querySelector(".songinfo").innerHTML = `No Song Selected`;
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
        return;
    }

    if (!track && lastPlayedTrack) {
        track = lastPlayedTrack;
    }

    if (track && shouldReplace) {
        lastPlayedTrack = track;
        currentSong.src = `/${currFolder}/` + track;
        document.querySelector(".songInfoImg").classList.add("rotate");
    }

    if (!pause && shouldReplace) {
        currentSong.play();
        play.src = "img/pause.svg";
    }


    document.querySelector(".songinfo").innerHTML = decodeURI(track) + `<img class="songInfoImg" src = "https://images.squarespace-cdn.com/content/v1/61abb71bd16d7417cc519fb4/1638672750636-9UEWA5IV2RC5YPGZ7KSO/label+services.jpg">`;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

};



async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card ">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                fill="none">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    stroke="black" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

        }

    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0], true, false)
        })
    })

}

async function main() {
    await getSongs("songs/")
    playMusic(songs[0], true)

    displayAlbums();



    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        } 
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", (e) => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}
        / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", () => {
        console.log("Previous Clicked ");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }


    })

    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next Clicked ");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        const volume = parseInt(e.target.value);
        updateVolume(volume);
    });
    
    document.addEventListener("keydown", (e) => {
        const input = document.querySelector(".range input");
        let currentVolume = parseInt(input.value);
    
        if (e.key === "ArrowLeft" || e.key === "-") {
            currentVolume = Math.max(0, currentVolume - 2);
        } else if (e.key === "ArrowRight" || e.key === "+") {
            currentVolume = Math.min(100, currentVolume + 2); 
        } else {
            return; // Exit if other key
        }
    
        input.value = currentVolume;
        updateVolume(currentVolume);
    });
    
    function updateVolume(volume) {
        const message = `Volume To ${volume}/100`;
        currentSong.volume = volume / 100;
    
        const volumeMsg = document.getElementById("volume-message");
        volumeMsg.textContent = message;
    }
    


    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .20
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }
    })

}


main();


