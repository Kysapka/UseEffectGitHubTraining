import React, {useEffect, useState} from 'react';
import s from './Github.module.css'
import axios from "axios";

type SearchUserType = {
    login: string
    id: number
}

/*SEARCH COMPONENT */
type SearchPropsType = {
    value: string
    onSubmit: (fixedValue: string) => void
}
export const Search = (props: SearchPropsType) => {

    const [tempSearch, setTempSearch] = useState('')

    useEffect(() => {
        setTempSearch(props.value)
    }, [props.value])

    return (
        <div>
            <input placeholder="search"
                   value={tempSearch}
                   onChange={(e) => {
                       setTempSearch(e.currentTarget.value)
                   }}/>
            <button onClick={() => {
                props.onSubmit(tempSearch)
            }}> find
            </button>
        </div>
    )
}

/*USERLIST COMPONENT */
type UsersListPropsType = {
    term: string
    selectedUser: SearchUserType | null
    onUserSelect: (user: SearchUserType) => void
}
type SearchResult = {
    items: SearchUserType[]
}
export const UserList = (props: UsersListPropsType) => {
    const [users, setUsers] = useState<SearchUserType[]>([])

    /* GET USERS */
    useEffect(() => {
        console.log("SYNC USERS")
        axios
            .get<SearchResult>(`https://api.github.com/search/users?q=${props.term}`)
            .then(res => {
                setUsers(res.data.items)
            })
    }, [props.term])

    return (
        <ul>
            {users.map(u => <li key={u.id} className={props.selectedUser === u ? s.selected : ''} onClick={() => {
                props.onUserSelect(u)
            }}> {u.login} </li>)}
        </ul>
    )
}

/*TIMER COMPONENT */
type TimerProps = {
    seconds: number
    onChange: (actualSeconds: number) => void
    startTimerSeconds: number
}
export const Timer = (props: TimerProps) => {
    const [seconds, setSeconds] = useState<number>(props.startTimerSeconds)

    /* EXPERIMENT SET_INTERVAL */
    useEffect(() => {
        setSeconds(props.seconds)
    }, [props.seconds])

    useEffect(() => {
        props.onChange(seconds)
    }, [seconds])

  useEffect(() => {
        let timerSetInt =  setInterval(() => {
            console.log("TICK")
            setSeconds((prev) => prev - 1)
        } , 1000)
      return () => {clearInterval(timerSetInt)}
    }, [])

    /* EXPERIMENT SET_TIMEOUT */
//     useEffect(() => {
//         setTimeout(() => {
//             setSeconds(seconds - 1)
//         }, 1000)
//     }, [seconds])
//
//
   return <div>{props.seconds}</div>
}

/*USERS DETAILS COMPONENT*/
type UserDetailsProps = {
    user: SearchUserType | null
}
type UserType = {
    login: string
    id: number
    avatar_url: string
    followers: number
}
export const UserDetails: React.FC<UserDetailsProps> = ({user, ...props}) => {

    const startTimerSeconds = 10;

    const [userDetails, setUserDetails] = useState<null | UserType>(null)

    useEffect(() => {
        if (!!user) {
            console.log("SYNC USER DETAILS")
            axios.get<UserType>(`https://api.github.com/users/${user.login}`)
                .then(res => {
                    setUserDetails(res.data)
                    setSeconds(10)
                })
        }
    }, [user])

    let [seconds, setSeconds] = useState<number>(startTimerSeconds)

    useEffect(() => {
        if (seconds < 1 ) {
            setUserDetails(null)
            setSeconds(startTimerSeconds)
        }
    }, [seconds])

    return (
        <div>
            {userDetails && <div>
                <h2>{userDetails.login}</h2>
                <img src={userDetails.avatar_url} alt={"ava_img"}/>
                <br/>
                {userDetails.login}, {userDetails.followers}
                <Timer seconds={seconds} onChange={setSeconds} startTimerSeconds={startTimerSeconds}/>
            </div>}
        </div>
    )
}

/* GIT HUB COMPONENT*/
export const Github = () => {
    let initialSearch = 'it-kamasutra'

    const [selectedUser, setSelectedUser] = useState<SearchUserType | null>(null)
    const [searchTerm, setSearchTerm] = useState(initialSearch)

    /* SELECT USERS */
    useEffect(() => {
        console.log('SYNC TAB TITLE')
        if (selectedUser) {
            document.title = selectedUser.login
        }
    }, [selectedUser])

    return <div className={s.container}>
        <div>
            <Search value={searchTerm} onSubmit={(value: string) => {
                setSearchTerm(value)
            }}/>
            <button onClick={() => {
                setSearchTerm(initialSearch)
            }}>reset
            </button>
            <UserList term={searchTerm} selectedUser={selectedUser} onUserSelect={setSelectedUser}/>
        </div>
        <UserDetails user={selectedUser}/>
    </div>
}