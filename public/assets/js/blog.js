let blogs = []

function addBlog(event){
    event.preventDefault()

    let title = document.getElementById('input-blog-title').value
    let content = document.getElementById('input-blog-content').value
    let image = document.getElementById('input-blog-image').files
    console.log(image);

    image = URL.createObjectURL(image[0])

    let blog = {
        title: title,
        content: content,
        image: image,
        author: "Rizal Fakhruddin",
        postAt: new Date()
    }

    blogs.push(blog)
    console.log(blogs)

    renderBlog()

}

// DOM Manipulation

function renderBlog() {
    let contentContainer = document.getElementById('contents')

    contentContainer.innerHTML = firtsBlogContent()

    for (let i = 0; i <  blogs.length; i++) {
        contentContainer.innerHTML += `<div class="blog-list-item">
        <div class="blog-image">
          <img src="${blogs[i].image}" alt="" />
        </div>
        <div class="blog-content">
          <div class="btn-group">
            <button class="btn-edit">Edit Post</button>
            <button class="btn-post">Post Blog</button>
          </div>
          <h1>
            <a href="blog-detail.html" target="_blank"
              >${blogs[i].title}</a
            >
          </h1>
          <div class="detail-blog-content">
          ${getTime(blogs[i].postAt)} | ${blogs[i].author}
          </div>
          <p>
            ${blogs[i].content}
          </p>
          <div style= "text-align: right;">
            <span style="font-size: 13px; color: grey;">
            ${getDistanceTime (blogs[i].postAt)}
            </span>
          </div> 
        </div>
      </div>`
    }
}

function firtsBlogContent(){
  return `<div class="blog-list-item">
  <div class="blog-image">
    <img src="assets/img/profiil.jpg" alt="" />
  </div>
  <div class="blog-content">
    <div class="btn-group">
      <button class="btn-edit">Edit Post</button>
      <button class="btn-post">Post Blog</button>
    </div>
    <h1>
      <a href="blog-detail.html" target="_blank"
        >Kegiatan Pembelajaran di PAUDQU SALSABILA</a
      >
    </h1>
    <div class="detail-blog-content">
      6 Januari 2022 22:30 WIB | Rizal Fakhruddin
    </div>
    <p>
      Ketimpangan sumber daya manusia (SDM) di sektor digital masih
      menjadi isu yang belum terpecahkan. Berdasarkan penelitian
      ManpowerGroup, ketimpangan SDM global, termasuk Indonesia,
      meningkat dua kali lipat dalam satu dekade terakhir. Lorem ipsum,
      dolor sit amet consectetur adipisicing elit. Quam, molestiae
      numquam! Deleniti maiores expedita eaque deserunt quaerat! Dicta,
      eligendi debitis?
    </p>
  </div>`
}

let month = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des']

function getTime(time) {  
  //mengaambil data dari variable postAt diatas 
  //time sendiri adalah parameter yang berfungsi untuk index


    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    let fullTime = `${date} ${month[monthIndex] } ${year} ${hours}:${minutes} WIB`

    return fullTime;
}


function getDistanceTime(time) {


  let timeNow = new Date();
  let timePost = time;


  let distance = timeNow - timePost; //menghasilkan dalam bentuk satuan mili second


  let milisecond = 1000
  let secondInHours = 3600
  let hoursInDay = 23
  let second = 60
  let minutes = 60


  let distanceDay = Math.floor(distance / (milisecond *secondInHours *hoursInDay)) //math.floor berfungsi untuk mebulatkan sebuah bilangan
  let distanceHours = Math.floor(distance / (milisecond *second *minutes))
  let distanceMinutes = Math.floor(distance / (milisecond * second))
  let distanceSecond = Math.floor(distance / milisecond)

  if(distanceDay >= 1){
      return `${distanceDay} day ago`;
    } else {
      if (distanceHours >= 1){
      return `${distanceHours} hours ago`;
      } else {
        if (distanceMinutes >= 1) {
          return `${distanceMinutes} minutes ago`;
        } else {
            return `${distanceSecond} second ago`;
        }
      }
    }
}

// set interval berfungsi untuk menjalankan sebuah fungsi sesuai dengan jumlah intervalnya
setInterval(() => {
  renderBlog()
},5000)