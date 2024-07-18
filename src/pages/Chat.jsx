import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import Logout from "../components/Logout";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();

  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isChatActive, setIsChatActive] = useState(false);

  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 767);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const getUserfromLocal = async () => {
      if (!localStorage.getItem("chat-app-current-user")) {
        navigate("/login");
      } else {
        setCurrentUser(
          await JSON.parse(localStorage.getItem("chat-app-current-user"))
        );
      }
    };
    getUserfromLocal();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setContacts(data.data);
        } else {
          navigate("/setAvatar");
        }
      }
    };
    fetchAllUsers();
  }, [currentUser, navigate]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    setIsChatActive(true);
  };

  return (
    <>
      <Container>
            <div className="container">
                {((!isChatActive) && (isMobileView)) ?
                (<ContactsContainer>
                    <Contacts contacts={contacts} changeChat={handleChatChange} />
                </ContactsContainer>
                ): 
                ((!isMobileView) && (<Contacts contacts={contacts} changeChat={handleChatChange} />))}
                
                {(isChatActive) ?

                    ((<ChatContainerWrapper>
                        <ChatContainer currentChat={currentChat} socket={socket} />
                        {(isMobileView) &&
                        <BackToContactsButton onClick={() => setIsChatActive(false)}>
                        🡰
                        </BackToContactsButton>}
                    </ChatContainerWrapper>)
                    
                    ) 
                        :
                    ((!isMobileView) && (<><Welcome/> <Logout/></>))
                }
            </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    @media screen and (min-width: 767px){
        display: grid;
        grid-template-columns: 25% 75%;
    }
    
  }
`;

const ContactsContainer = styled.div`
  @media screen and (max-width: 767px) {
    display: block;
    width: 90%;
    height: 88vh;
    overflow: hidden;
    position: absolute;
    top: 6vh;
    left: 5%;
    border-radius: 10px;
    box-shadow: 2px 2px 5px gray;
  }
`;

const ChatContainerWrapper = styled.div`
height: 100%;
overflow: hidden;
@media screen and (max-width: 767px) {
    display: block;
    border-radius: 10px;
    box-shadow: 2px 2px 5px gray;
    width: 90vw;
    height: 88vh;
    overflow: hidden;
    position: absolute;
    top : 6vh;
    left: 5vw;
  }
`;

const BackToContactsButton = styled.button`
  position: absolute;
  top: 2.6%;
  right: 25vw;
  padding: 4px 8px;
  background-color: cyan;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: black;
  font-weight: bolder;
`;

