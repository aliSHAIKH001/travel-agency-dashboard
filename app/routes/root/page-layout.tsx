import {getExistingUser, logoutUser, storeUserData} from "~/appwrite/auth";
import {Outlet, redirect, useNavigate} from "react-router";
import {account} from "~/appwrite/client";
import RootNavbar from "../../../components/RootNavbar";

export async function clientLoader() {
    try{
        const user = await account.get();
        // if the user has not signed in already
        if (!user.$id) return redirect("/sign-in");

        const existingUser = await getExistingUser(user.$id)
        return existingUser?.$id ? existingUser: await storeUserData();
    } catch(e){
        console.log("Error fetching User", e)
        return redirect("/sign-in")
    }
}

const PageLayout = () => {
    return (
        <div className="bg-light-200">
            <RootNavbar/>
            <Outlet/>
        </div>
    )
}
export default PageLayout
