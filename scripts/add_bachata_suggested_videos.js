const fs = require('fs');
const path = require('path');

const VIDEOS_JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'videos.json');

const bachataSuggestedVideos = [
  {
    id: "sug-bachata-1",
    youtubeId: "VZyyfX8WbT4",
    url: "http://www.youtube.com/watch?v=VZyyfX8WbT4&start=1",
    title: "Ataca y La Alemana | Sensual Bachata | Bachata Geneva Festival 2017",
    author: "Bachata Geneva Festival",
    avatar: "https://i.pravatar.cc/150?u=BachataGenevaFestival",
    views: "18.5M views",
    publishedAt: "Sensual Demo",
    description: "Ataca y La Alemana | Sensual Bachata | Bachata Geneva Festival 2017",
    thumbnail: "https://i.ytimg.com/vi/VZyyfX8WbT4/hqdefault.jpg",
    gifUrl: "/videos/trailers/VZyyfX8WbT4_sug_10s.gif",
    webmUrl: "/videos/trailers/VZyyfX8WbT4_sug_10s.webm"
  },
  {
    id: "sug-bachata-2",
    youtubeId: "Df9GrBwgyjQ",
    url: "http://www.youtube.com/watch?v=Df9GrBwgyjQ&start=74",
    title: "Daniel y Desiree - Bachata Sensual | 10th World Stars Salsa Festival 2026",
    author: "World Stars Salsa Festival",
    avatar: "https://i.pravatar.cc/150?u=WorldStarsSalsaFestival",
    views: "24.1M views",
    publishedAt: "Social Showcase",
    description: "Daniel y Desiree - Bachata Sensual | 10th World Stars Salsa Festival 2026",
    thumbnail: "https://i.ytimg.com/vi/Df9GrBwgyjQ/hqdefault.jpg",
    gifUrl: "/videos/trailers/Df9GrBwgyjQ_sug_10s.gif",
    webmUrl: "/videos/trailers/Df9GrBwgyjQ_sug_10s.webm"
  },
  {
    id: "sug-bachata-3",
    youtubeId: "zV1qLYukTH8",
    url: "http://www.youtube.com/watch?v=zV1qLYukTH8&start=59",
    title: "Marco y Sara - Bachata Demo | 10th World Stars Salsa Festival 2026",
    author: "World Stars Salsa Festival",
    avatar: "https://i.pravatar.cc/150?u=WorldStarsSalsaFestival",
    views: "12.8M views",
    publishedAt: "Festival Demo",
    description: "Marco y Sara - Bachata Demo | 10th World Stars Salsa Festival 2026",
    thumbnail: "https://i.ytimg.com/vi/zV1qLYukTH8/hqdefault.jpg",
    gifUrl: "/videos/trailers/zV1qLYukTH8_sug_10s.gif",
    webmUrl: "/videos/trailers/zV1qLYukTH8_sug_10s.webm"
  },
  {
    id: "sug-bachata-4",
    youtubeId: "hHR-e_t-yCE",
    url: "http://www.youtube.com/watch?v=hHR-e_t-yCE&start=2",
    title: "Korke y Judith - Bachata Sensual Workshop | Bachata Geneva Festival",
    author: "Bachata Geneva Festival",
    avatar: "https://i.pravatar.cc/150?u=BachataGenevaFestival",
    views: "9.4M views",
    publishedAt: "Workshop Demo",
    description: "Korke y Judith - Bachata Sensual Workshop | Bachata Geneva Festival 2018",
    thumbnail: "https://i.ytimg.com/vi/hHR-e_t-yCE/hqdefault.jpg",
    gifUrl: "/videos/trailers/hHR-e_t-yCE_sug_10s.gif",
    webmUrl: "/videos/trailers/hHR-e_t-yCE_sug_10s.webm"
  },
  {
    id: "sug-bachata-5",
    youtubeId: "HO3cD53RHF4",
    url: "http://www.youtube.com/watch?v=HO3cD53RHF4&start=2",
    title: "Ronald y Alba - Bachata Social Demo | World Stars Salsa Festival",
    author: "World Stars Salsa Festival",
    avatar: "https://i.pravatar.cc/150?u=WorldStarsSalsaFestival",
    views: "15.3M views",
    publishedAt: "Social Demo",
    description: "Ronald y Alba - Bachata Social Demo | World Stars Salsa Festival",
    thumbnail: "https://i.ytimg.com/vi/HO3cD53RHF4/hqdefault.jpg",
    gifUrl: "/videos/trailers/HO3cD53RHF4_sug_10s.gif",
    webmUrl: "/videos/trailers/HO3cD53RHF4_sug_10s.webm"
  },
  {
    id: "sug-bachata-6",
    youtubeId: "GK7q-LBC36g",
    url: "http://www.youtube.com/watch?v=GK7q-LBC36g&start=3",
    title: "Kike y Nahir - Sensual Bachata Workshop | 10th World Stars Salsa Festival 2026",
    author: "World Stars Salsa Festival",
    avatar: "https://i.pravatar.cc/150?u=WorldStarsSalsaFestival",
    views: "8.7M views",
    publishedAt: "Workshop Showcase",
    description: "Kike y Nahir - Sensual Bachata Workshop | 10th World Stars Salsa Festival 2026",
    thumbnail: "https://i.ytimg.com/vi/GK7q-LBC36g/hqdefault.jpg",
    gifUrl: "/videos/trailers/GK7q-LBC36g_sug_10s.gif",
    webmUrl: "/videos/trailers/GK7q-LBC36g_sug_10s.webm"
  },
  {
    id: "sug-bachata-7",
    youtubeId: "fEZdmgHNa10",
    url: "http://www.youtube.com/watch?v=fEZdmgHNa10&start=81",
    title: "Pablo y Raquel - Bachata Social | World Stars Salsa Festival 2026",
    author: "World Stars Salsa Festival",
    avatar: "https://i.pravatar.cc/150?u=WorldStarsSalsaFestival",
    views: "11.2M views",
    publishedAt: "Social Demo",
    description: "Pablo y Raquel - Bachata Social | World Stars Salsa Festival 2026",
    thumbnail: "https://i.ytimg.com/vi/fEZdmgHNa10/hqdefault.jpg",
    gifUrl: "/videos/trailers/fEZdmgHNa10_sug_10s.gif",
    webmUrl: "/videos/trailers/fEZdmgHNa10_sug_10s.webm"
  },
  {
    id: "sug-bachata-8",
    youtubeId: "xrm7PP1mbtI",
    url: "http://www.youtube.com/watch?v=xrm7PP1mbtI&start=3",
    title: "Melvin y Gatica - Bachata Sensual | Bachata Geneva Festival",
    author: "Bachata Geneva Festival",
    avatar: "https://i.pravatar.cc/150?u=BachataGenevaFestival",
    views: "14.6M views",
    publishedAt: "Sensual Social",
    description: "Melvin y Gatica - Bachata Sensual | Bachata Geneva Festival",
    thumbnail: "https://i.ytimg.com/vi/xrm7PP1mbtI/hqdefault.jpg",
    gifUrl: "/videos/trailers/xrm7PP1mbtI_sug_10s.gif",
    webmUrl: "/videos/trailers/xrm7PP1mbtI_sug_10s.webm"
  },
  {
    id: "sug-bachata-9",
    youtubeId: "vo_qsb635u0",
    url: "http://www.youtube.com/watch?v=vo_qsb635u0&start=2",
    title: "Abdel y Lety - Bachata Demo | World Stars Salsa Festival 2026",
    author: "World Stars Salsa Festival",
    avatar: "https://i.pravatar.cc/150?u=WorldStarsSalsaFestival",
    views: "16.8M views",
    publishedAt: "Social Showcase",
    description: "Abdel y Lety - Bachata Demo | World Stars Salsa Festival 2026",
    thumbnail: "https://i.ytimg.com/vi/vo_qsb635u0/hqdefault.jpg",
    gifUrl: "/videos/trailers/vo_qsb635u0_sug_10s.gif",
    webmUrl: "/videos/trailers/vo_qsb635u0_sug_10s.webm"
  },
  {
    id: "sug-bachata-10",
    youtubeId: "LM875jeR-PM",
    url: "http://www.youtube.com/watch?v=LM875jeR-PM&start=65",
    title: "Janis y Zoe - Bachata Social Demo | 10th World Stars Salsa Festival 2026",
    author: "World Stars Salsa Festival",
    avatar: "https://i.pravatar.cc/150?u=WorldStarsSalsaFestival",
    views: "13.9M views",
    publishedAt: "Social Demo",
    description: "Janis y Zoe - Bachata Social Demo | 10th World Stars Salsa Festival 2026",
    thumbnail: "https://i.ytimg.com/vi/LM875jeR-PM/hqdefault.jpg",
    gifUrl: "/videos/trailers/LM875jeR-PM_sug_10s.gif",
    webmUrl: "/videos/trailers/LM875jeR-PM_sug_10s.webm"
  }
];

const videosData = JSON.parse(fs.readFileSync(VIDEOS_JSON_PATH, 'utf-8'));
videosData.bachataSuggestedVideos = bachataSuggestedVideos;

fs.writeFileSync(VIDEOS_JSON_PATH, JSON.stringify(videosData, null, 2), 'utf-8');
console.log("✓ Successfully added 10 Bachata recommendation cards to videos.json under 'bachataSuggestedVideos'");
