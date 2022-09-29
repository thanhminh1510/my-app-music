const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = 'F8-PLAYER'

const player  = $('.player')
const playlist = $('.playlist')
const heading = $('.dashboard h2')
const CD_thumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.CD')
const playbtn  = $('.btn-toggle-play')
const progress =  $('#progress')
const nextbtn = $('.btn-next')
const prebtn = $('.btn-pre')
const random_song_btn = $('.btn-random')
const repeat_song_btn = $('.btn-repeat')
// console.log(progress )
const app =  {
    currentIndex :0,
    isPlaying:false,
    isRandom:false,
    isRepeat:false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    song:[
        {
            name:"Thương em đến già",
            singer : "Lê Bảo Bình",
            path:'./assets/music/song1.mp3',
            img:'./assets/img/LBB.jpg',
        },
        {
            name:"Có ai chung tình được mãi",
            singer : "Đinh Tùng Huy",
            path:'./assets/music/song2.mp3',
            img:'./assets/img/DTH.jpg',
        },
        {
            name:"Có không giữ mất đừng tìm",
            singer : "Trúc Nhân",
            path:'./assets/music/song3.mp3',
            img:'./assets/img/TN.jpg',
        },
        {
            name:"Ai muốn nghe không",
            singer : "Đen Vâu",
            path:'./assets/music/song4.mp3',
            img:'./assets/img/DV.jpg',
        },
        {
            name:"Có không giữ mất đừng tìm",
            singer : "Trúc Nhân",
            path:'./assets/music/song3.mp3',
            img:'./assets/img/TN.jpg',
        },
    ],
    setConfig:function(key,value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    render:function(){
        // console.log(123)
        const html  = this.song.map((song,index) =>{
            return`<div class="song ${index === this.currentIndex ? 'active':''}" data-index = "${index}">
            <div class="thumb" style="background-image: url('${song.img}')">          
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
              <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div> 
        </div>`
        })
    playlist.innerHTML = html.join('')

    },
    
   
   
   
    defineProperties : function(){
        Object.defineProperty(this,'currentSong',{
            get: function(){
                return this.song[this.currentIndex];
            }
        })
    },

    loadCurrentSong:function(){ 
        // console.log(audio)
        heading.textContent = this.currentSong.name
        CD_thumb.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src  = this.currentSong.path
        // console.log(audio.src)
    },
    handleven:function(){
        const _this = this
        const cdWitdh = cd.offsetWidth

        // Xử lý CD quay / dừng
        const cdthumb_animate= CD_thumb.animate([
            {    transform:'rotate(360deg)'}
        ],{
            duration:10000, // 10s
            iteration:Infinity
        })
        cdthumb_animate.pause()



        // Xử lý click play
        playbtn.onclick = function(){
            if (_this.isPlaying){
                // thao tác dừng
                _this.isPlaying = false;
                audio.pause()
                player.classList.remove("playing")
            }else{
                // thao tác chạy bài
                audio.play()
            }
            audio.onplay = function(){
                player.classList.add("playing")
                _this.isPlaying = true;
                cdthumb_animate.play()
            }
            audio.onpause = function(){
                _this.isPlaying = false;
                player.classList.remove("playing")
                cdthumb_animate.pause()
            }
            //tiến độ bài hát thay đổi 
            audio.ontimeupdate = () =>{
                if (audio.duration){
                    const current_progress = Math.floor(audio.currentTime / audio.duration*100)
                    progress.value = current_progress
                }
            }
        }

        // Xử lý phóng to thu nhỏ CD
        document.onscroll = function(){
            const scrollTop =  document.documentElement.scrollTop|| window.scrollY
            const newWidth = cdWitdh - scrollTop;
            
            cd.style.width = newWidth > 0 ? newWidth +'px': 0;
            cd.style.opacity = newWidth / cdWitdh
        }
        //  tua song
        progress.oninput = function(e){
            const seekTime = audio.duration / 100 * e.target.value
            console.log(e.target.value);
            audio.currentTime = seekTime
            progress.onchange = function(){
              audio.play()
            }
        }
        //  chuyển bài khác tới
        nextbtn.onclick = function(){
            if(_this.isRandom){
                _this.random_song()
            }
            else{
                _this.next_song()
            }
            _this.render()
            _this.scrollToActiveSong()
            playbtn.click()
            audio.play()
        }
          //  chuyển bài khác lui
        prebtn.onclick = function(){
            if(_this.isRandom){
                _this.random_song()
            }
            else{
                _this.pre_song()
            }
            _this.render()
            playbtn.click()
            audio.play()
        }
        // Xử lý repeat bài hát
        repeat_song_btn.onclick = function(){
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat)
            repeat_song_btn.classList.toggle('active',_this.isRepeat)
        }
        // chuyển bài hát khi kết thức
        audio.onended = function(){
            if (_this.isRepeat){
                audio.play()
            }else{
                nextbtn.click()
            }
        }
        random_song_btn.onclick = function(){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom',_this.isRandom)
            random_song_btn.classList.toggle("active", _this.isRandom)
        }
        playlist.onclick = function(e){
            const song_element= e.target.closest('.song:not(.active)') 
            //  Xử lý khi click vào song option
            if (song_element || !e.target.closest('.option')){
                // Xử lý khi click vào song
                if(song_element){
                   _this.currentIndex = Number(song_element.dataset.index)
                   _this.loadCurrentSong()
                   _this.render()
                    playbtn.click()
                    audio.play()
                }            
            }
        }
        
    },
    // function chuyển bài tới 
    scrollToActiveSong : function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior :'smooth',
                block: 'nearest',
            })
        },500)
    },
    next_song : function(){
        this.currentIndex++
        if (this.currentIndex >= this.song.length){
            this.currentIndex = 0 
        }
        this.loadCurrentSong();
    },
    loadConfig : function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    pre_song : function(){
        this.currentIndex--
        if (this.currentIndex < 0){
            this.currentIndex = this.song.length - 1 
        }
        this.loadCurrentSong();
    },
    random_song : function(){
        let newIndex 
        do{
            newIndex =  Math.floor(Math.random() * this.song.length)
        }while(newIndex === this.currentIndex)
        this.currentIndex  = newIndex
        this.loadCurrentSong();
    },
    

    start: function(){
        // gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        //  định nghĩa các thuốc tính cho object
        this.defineProperties()
        //  lắng nghe và định nghĩa các sự kiện
        this.handleven()


        // tải bài hát lên UI
        this.loadCurrentSong()

        // render ra html 
        this.render()
        repeat_song_btn.classList.toggle('active',this.isRepeat)
        random_song_btn.classList.toggle('active',this.isRandom)

    }
}

app.start()

