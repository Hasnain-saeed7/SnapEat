import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserRegister from '../pages/auth/UserRegister';
import ChooseRegister from '../pages/auth/ChooseRegister';
import UserLogin from '../pages/auth/UserLogin';
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister';
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin';
import Home from '../pages/general/Home';
import Saved from '../pages/general/Saved';
import ReelView from '../pages/general/ReelView';
import OrderPage from '../pages/general/OrderPage';
import PartnerMenu from '../pages/general/PartnerMenu';
import Messages from '../pages/general/Messages';
import ConversationsList from '../pages/general/ConversationsList';
import BottomNav from '../components/BottomNav';
import CreateFood from '../pages/food-partner/CreateFood';
import FoodPartnerProfile from '../components/FoodPartnerProfile';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<ChooseRegister />} />
                <Route path="/user/register" element={<UserRegister />} />
                <Route path="/user/login" element={<UserLogin />} />
                <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
                <Route path="/food-partner/login" element={<FoodPartnerLogin />} />
                <Route path="/" element={<ChooseRegister />} />
                <Route path="/home" element={<><Home /><BottomNav /></>} />
                <Route path="/saved" element={<><Saved /><BottomNav /></>} />
                <Route path="/reels" element={<ReelView />} />
                <Route path="/order" element={<OrderPage />} />
                <Route path="/partner/:id/menu" element={<PartnerMenu />} />
                <Route path="/messages" element={<><ConversationsList /><BottomNav /></>} />
                <Route path="/messages/:conversationId" element={<Messages />} />
                <Route path="/food-partner/create-food" element={<CreateFood />} />
                <Route path="/food-partner/profile/:id" element={<FoodPartnerProfile />} />
            </Routes>
        </Router>
    )
}

export default AppRoutes





