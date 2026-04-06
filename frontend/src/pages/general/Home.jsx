
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'
 


const Home = () => {
    const [videos, setVideos] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const role = localStorage.getItem('role')

    useEffect(() => {
        // Fetch current user data (only for regular users, partners can skip this)
        if (role === 'user') {
            axios.get("http://localhost:3000/api/auth/user/me", { withCredentials: true })
                .then(response => {

                    setCurrentUser(response.data.user)
                })
                .catch(err => {
                    console.error('❌ Failed to fetch current user:', err.response?.status, err.response?.data)
                })
        }
        
        // Fetch videos - works for both users and partners now
        axios.get("http://localhost:3000/api/food", { withCredentials: true })
            .then(response => {
                setVideos(response.data.foodItems)
            })
            .catch(() => {})
    }, [role])

    async function likeVideo(item) {
        const response = await axios.post("http://localhost:3000/api/food/like", { foodId: item._id }, { withCredentials: true })
        if (response.data.like) {
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount + 1 } : v))
        } else {
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount - 1 } : v))
        }
    }

    async function saveVideo(item) {
        const response = await axios.post("http://localhost:3000/api/food/save", { foodId: item._id }, { withCredentials: true })
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


 