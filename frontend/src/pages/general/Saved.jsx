import React, { useEffect, useState } from 'react'
import '../../styles/reels.css'
import API from '../../api/axios'
import ReelFeed from '../../components/ReelFeed'

const Saved = () => {
    const [ videos, setVideos ] = useState([])

    useEffect(() => {
        API.get("/api/food/save")
            .then(response => {
                const savedFoods = response.data.savedFoods
                    .map((item) => item.food)
                    .filter(Boolean)
                setVideos(savedFoods)
            })
            .catch(() => {
                setVideos([])
            })
    }, [])

    const removeSaved = async (item) => {
        try {
            await API.post("/api/food/save", { foodId: item._id })
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: Math.max(0, (v.savesCount ?? 1) - 1) } : v))
        } catch {
            // noop
        }
    }

    return (
        <ReelFeed
            items={videos}
            onSave={removeSaved}
            emptyMessage="No saved videos yet."
        />
    )
}

export default Saved
    





