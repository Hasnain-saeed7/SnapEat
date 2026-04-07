
import React, { useEffect, useState } from 'react'
import API from '../../api/axios';
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'
 


const Home = () => {
    const [videos, setVideos] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const role = localStorage.getItem('role')

    useEffect(() => {
        // Fetch current user data (only for regular users, partners can skip this)
        if (role === 'user') {
            API.get("/api/auth/user/me")
                .then(response => {

                    setCurrentUser(response.data.user)
                })
                .catch(err => {
                    console.error('❌ Failed to fetch current user:', err.response?.status, err.response?.data)
                })
        }
        
        // Fetch videos - works for both users and partners now
        API.get("/api/food")
            .then(response => {
                setVideos(response.data.foodItems)
            })
            .catch(() => {})
    }, [role])

    async function likeVideo(item) {
        const response = await API.post("/api/food/like", { foodId: item._id })
        if (response.data.like) {
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount + 1 } : v))
        } else {
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount - 1 } : v))
        }
    }

    async function saveVideo(item) {
        const response = await API.post("/api/food/save", { foodId: item._id })
        if (response.data.save) {
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount + 1 } : v))
        } else {
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount - 1 } : v))
        }
    }

    // ✅ NEW — updates comment count live when user posts
    function onCommentAdded(foodId) {
        setVideos(prev => prev.map(v =>
            v._id === foodId
                ? { ...v, commentsCount: (v.commentsCount ?? 0) + 1 }
                : v
        ))
    }


    function onCommentDeleted(foodId) {
        setVideos(prev => prev.map(v =>
            v._id === foodId
                ? { ...v, commentsCount: Math.max((v.commentsCount ?? 0) - 1, 0) }
                : v
        ))
    }

    return (
        <ReelFeed
            items={videos}
            onLike={likeVideo}
            onSave={saveVideo}
            onCommentAdded={onCommentAdded}
            onCommentDeleted={onCommentDeleted}
            currentUser={currentUser}
            emptyMessage="No videos available."
        />
    )
}

export default Home 


 