// npm i express ejs mysql2 jsonwebtoken dotenv bcrypt multer
require('dotenv').config();
const cors = require('cors')
require('./models/config')
const express = require("express");
const app = express();
const path = require("path");
const LoginRouter = require('./routers/login.router')
const MainRouter = require('./routers/main.router')
const WriteRouter = require('./routers/write.router')
const DetailRouter = require('./routers/detail.router')
const EditRouter = require('./routers/edit.router')
const MypageRouter = require('./routers/mypage.router')
const FollowRouter = require('./routers/follow.router')
const SettingsRouter = require('./routers/settings.router.js')
const ListRouter = require('./routers/list.router.js')
const StatsRouter = require('./routers/stats.router')
const axios = require("axios");


const cookieParser = require('cookie-parser');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
app.set ("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/upload")));
app.use(express.json());
app.use(express.urlencoded({extended : false}))
    app.use(cors({
        origin: [
            'http://localhost:3000',  
            'http://192.168.219.104:4000' 
        ],
        credentials: true
    }));
app.use(cookieParser());

app.use('/login', LoginRouter);
app.use('/main',  MainRouter);
app.use('/write', WriteRouter);
app.use('/detail', DetailRouter)
app.use('/edit', EditRouter)
app.use('/mypage', MypageRouter);
app.use('/follow', FollowRouter);
app.use('/api/setting', SettingsRouter);
app.use('/list', ListRouter)
app.use('/stats', StatsRouter);

app.get("/oauth", async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({
      result: 'fail',
      error: "인가 코드가 필요합니다."
    });
  }

  try {
    // 카카오 토큰 요청
    const tokenResponse = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code: code,
        client_secret: process.env.CLIENT_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
        }
      }
    );

    const { access_token } = tokenResponse.data;

    // 성공 응답
    res.redirect(`https://devops1.store/?access_token=${access_token}`);

  } catch (error) {
    console.error("카카오 로그인 처리 중 오류:", error.response?.data || error.message);
    res.status(500).send();
  }
});

// 카카오 사용자 정보 요청
app.get("/", async (req, res) => {
    const { access_token } = req.query;
    // 카카오 사용자 정보 요청
    const userResponse = await axios.get(
        "https://kapi.kakao.com/v2/user/me",
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
            }
        }
    );
    
    const { id, properties } = userResponse.data;
    const { nickname } = properties;
    res.json({id, properties, nickname});

});

app.listen(4000, (req,res)=> {
    console.log("server on")
})