const express = require('express') //const express

const app = express()
const PORT = 1000

const bcrypt = require('bcrypt')    //input bcrypt

const session = require('express-session')
const flash = require('express-flash')

const db = require('./connection/db') // set connection to postgres
const upload = require('./middlewares/fileUpload')

app.set('view engine', 'hbs') //set hbs

app.use('/public', express.static(__dirname + '/public')) //set public folder path
app.use('/uploads', express.static(__dirname + '/uploads')) //set public folder path

app.use(express.urlencoded({extended: false}))

app.use(
    session({
        cookie: {
            maxAge: 2 * 60 * 60 * 1000, // 2 jam
            secure: false,
            httpOnly: true
        },
        store: new session.MemoryStore(),
        saveUninitialized: true,
        resave: false,
        secret: 'secretValue'
    })
)

app.use(flash())

let isLogin = true

function getFullTime(time) {

    let month = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des']

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    let fullTime = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`

    return fullTime;
}

function getDistanceTime(time) {


    let timeNow = new Date();
    let timePost = time;
  
  
    let distance = timeNow - timePost;
  
    let milisecond = 1000
    let secondInHours = 3600
    let hoursInDay = 23
    let second = 60
    let minutes = 60
  
  
    let distanceDay = Math.floor(distance / (milisecond *secondInHours *hoursInDay))
    let distanceHours = Math.floor(distance / (milisecond *second *minutes))
    let distanceMinutes = Math.floor(distance / (milisecond * second))
    let distanceSecond = Math.floor(distance / milisecond)
  
  
    distanceDay = Math.floor(distanceDay);
  
    if(distanceDay >= 1){
        return(`${distanceDay} day ago`);
      } else {
        if (distanceHours >= 1){
        return(`${distanceHours} hours ago`);
        } else {
          if (distanceMinutes >= 1) {
            return(`${distanceMinutes} minutes ago`);
          } else {
              return(`${distanceSecond} second ago`);
          }
        }
      }
  }
  

app.get ('/', function(request, response){

    db.connect(function(err, client, done){ //funggsi yang dipanggil error, client isi table dan done itu penyelesaian
        if (err) throw err // akan menampilkan eror pada terminal jika ada code yang eror

        client.query('SELECT * FROM tb_prestasi', function(err, result){ //fungsi client untuk mengambil data pda tabel query
            if (err) throw err

            let data = result.rows //result.rows berisikan value dari database tb_blog

            response.render("index", {table : data, isLogin : request.session.isLogin, user: request.session.user})
            
        })
        
    })

})

app.get ('/register', function(request, response){
    response.render("register")
})

app.post('/register', function(request, response) {

    const {inputName, inputEmail, inputPassword} = request.body
    const hashedPassword = bcrypt.hashSync(inputPassword, 10)

    let query = `INSERT INTO tb_user (name, email, password) VALUES ('${inputName}', '${inputEmail}', '${hashedPassword}')`

    db.connect(function(err, client, done){
        if (err) throw err

        client.query(query, function(err, result){
            if(err) throw err
            
            request.flash('success', 'Signing Up Success!')
            response.redirect('/login')
         })

    })

})

app.get ('/login', function(request, response){
    response.render("login")
})

app.post('/login', function(request, response) {

    const {inputEmail, inputPassword} = request.body

    let query = `SELECT * FROM tb_user WHERE email = '${inputEmail}'`

    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(query, function(err, result) {
            if (err) throw err

            // console.log(result.rows);

            if(result.rows.length == 0) {
                request.flash('danger', 'Email belum terdaftar!')

                return response.redirect('/login')
            } 

            const isMatch = bcrypt.compareSync(inputPassword, result.rows[0].password)

            if(isMatch){
                request.session.isLogin = true
                request.session.user = {
                    id: result.rows[0].id,
                    name: result.rows[0].name,
                    email: result.rows[0].email
                }

                request.flash('success', 'Login Success!')
                response.redirect('/blog')

            } else {
                request.flash('danger', 'Password tidak cocok!')
                response.redirect('/login')
            }

        })
    })
})

app.get('/logout', function(request, response){
    request.session.destroy()

    response.redirect('/blog')
})

app.get ('/contact', function(request, response){
    response.render("contact", {isLogin : request.session.isLogin, user: request.session.user})
})

app.get ('/blog', function(request, response){
        
        let query = `SELECT tb_blog.id, title, tb_blog.content, tb_blog.post_at, tb_user.name AS author, tb_blog.author_id, tb_blog.image
                    FROM tb_blog LEFT JOIN  tb_user ON tb_blog.author_id = tb_user.id`
    
        db.connect(function(err, client, done){ //funggsi yang dipanggil error, client isi table dan done itu penyelesaian
        if (err) throw err // akan menampilkan eror pada terminal jika ada code yang eror

        client.query(query, function(err, result){ //fungsi client untuk mengambil data pda tabel query
            if (err) throw err

            let data = result.rows //result.rows berisikan value dari database tb_blog
            
            let dataBlogs = data.map(function(field){ //map untuk mapping data yang ada di array penampung value
                return {
                    ...field,
                    isLogin : request.session.isLogin,
                    postAt: getFullTime(field.post_at), 
                    distance: getDistanceTime(field.post_at) //properti postAt dan distance mengambil value dari parameter filed dari database dan dimasukkan kedalam fungsi
                }
            })

            response.render("blog", {isLogin : request.session.isLogin, user: request.session.user, blogs : dataBlogs})
            
        })
        
    })
    
    
 })

app.post('/blog', upload.single('inputImage'), function(request, response) {

    let data = request.body
    let image = request.file.filename
    let authorId = request.session.user.id

    let query = `INSERT INTO tb_blog (title, content, image, author_id) VALUES ('${data.inputTitle}', '${data.inputContent}', '${image}', '${authorId}')`

    db.connect(function(err, client, done){
        if (err) throw err

        client.query(query, function(err, result){
            if(err) throw err
    
            response.redirect('/blog')
         })

    })

})

app.get ('/add-blog', function(request, response){

    if(!request.session.isLogin){
        request.flash('danger', 'Plesae Log In!')
        return response.redirect('/login')
    }

    response.render("add-blog",{user: request.session.user, isLogin: request.session.isLogin})
})

app.get ('/blog-detail/:id', function(request, response){

    let id = request.params.id

    let query = `SELECT tb_blog.id, title, tb_blog.content, tb_blog.post_at, tb_user.name AS author, tb_blog.author_id, tb_blog.image
    FROM tb_blog LEFT JOIN  tb_user ON tb_blog.author_id = tb_user.id WHERE tb_blog.id = ${id}`

    db.connect(function(err, client, done){
        if (err) throw err

        client.query(query, function(err, result){
            if (err) throw err

            let data = result.rows[0]

            

            response.render("blog-detail", {id:id, blog: data, user: request.session.user, isLogin: request.session.isLogin})
    
        })
        
    })
    
})

app.get ('/delete-blog/:id', function(request, response){

    if(!request.session.isLogin){
        request.flash('danger', 'You are not a User. Log In Here!')
        return response.redirect('/login')
    }

    let id = request.params.id

    let query = `DELETE FROM tb_blog WHERE id = ${id}`

    db.connect(function(err, client, done){
        if (err) throw err

        client.query(query, function(err, result){
            if (err) throw err

            response.redirect('/blog')
    
        })
        
    })
    
})

app.get ('/edit-news/:id', function(request, response){

    if(!request.session.isLogin){
        request.flash('danger', 'You are not a User. Log In Here!')
        return response.redirect('/login')
    }

    let id = request.params.id

    let query = `SELECT * FROM tb_blog WHERE id = ${id}`

    db.connect(function(err, client, done){
        if (err) throw err

        client.query(query, function(err, result){
            if (err) throw err

            let data = result.rows[0]
            
            response.render('edit-news', {news: data, id: id, isLogin : request.session.isLogin, user: request.session.user})
    
        })
        
    })
    
})

app.post('/edit-news/:id', upload.single('inputImage'), function(request, response) {

    let id = request.params.id
    let image = request.file.filename
    let data = request.body

    let query = `UPDATE tb_blog SET title= '${data.updateTitle}', content= '${data.updateContent}', image='${image}' WHERE id= ${id}`

    db.connect(function(err, client, done){
        if (err) throw err

        client.query(query, function(err, result){
            if(err) throw err
    
            response.redirect('/blog')
         })

    })

})

app.listen(PORT, function(){
    console.log("Server starting on PORT 1000")
})