import { BrowserRouter, Routes, Route } from "react-router-dom";
import Firstpage from "./Firstpage";
import Main from "./Main";

const MyRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route exact path = "/" element = {<Main />} />
                <Route exact path = "/main" element = {<Main />} />
            </Routes>
        </BrowserRouter>
    )
}

export default MyRoutes