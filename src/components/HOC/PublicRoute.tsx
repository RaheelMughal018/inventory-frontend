import {Navigate} from 'react-router'


const PublicRoute = ({ children }: { children: React.ReactNode }) => {

    const token = localStorage.getItem("access_token")
    return token ? <Navigate to="/" replace /> : children
  }


export default PublicRoute