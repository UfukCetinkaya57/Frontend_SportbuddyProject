import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/message.css'; // CSS dosyasını içe aktar

const Message = () => {
  const { activityId } = useParams();
  const [messages, setMessages] = useState([]);
  const [senderName, setSenderName] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [activityName, setActivityName] = useState("");
  const messagesEndRef = useRef(null); // Referans oluştur

  const getUserName = async (userId) => {
    try {
      const response = await axios.get(`https://localhost:7214/api/Profile/getProfileById?userId=${userId}`);
      const userData = response.data;
      const fullName = `${userData.firstName} ${userData.lastName}`;
      return fullName;
    } catch (error) {
      console.error('Error getting user name:', error);
      return ""; // Hata durumunda boş bir dize döndürülebilir veya başka bir işlem yapılabilir.
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeToken(token);
      setUserId(decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
      setSenderName(`${decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]} ${decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"]}`);
      axios.get(`https://localhost:7214/api/Activity/GetActivityById?activityId=${activityId}`)
        .then(response => {
          setActivityName(response.data.activityName);
        })
        .catch(error => {
          console.error('Error getting activity name:', error);
        });
    }
  }, [activityId]);

  useEffect(() => {
    axios.get(`https://localhost:7214/api/Messages/GetListMessagesByActivityId?activityId=${activityId}`)
      .then(async response => {
        const messagesData = response.data;
        const updatedMessages = await Promise.all(messagesData.map(async msg => {
          const senderDisplayName = await getUserName(msg.userId);
          return { ...msg, senderDisplayName };
        }));
        const sortedMessages = updatedMessages.sort((a, b) => new Date(a.messageSendDate) - new Date(b.messageSendDate));
        setMessages(sortedMessages);
      })
      .catch(error => {
        console.error('Error getting messages:', error);
      });
  }, [activityId]);

  useEffect(() => {
    scrollToBottom(); // Yeniden render edildiğinde en alt kısmına kaydır
  }, [messages]);

  const decodeToken = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  }

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    const newMessage = {
      activityId,
      userId,
      messageContent: message,
      messageSendDate: new Date().toISOString(),
      senderName,
      senderDisplayName: senderName
    };
    axios.post('https://localhost:7214/api/Messages/AddMessage', newMessage)
      .then(response => {
        console.log('Message sent successfully.');
        setMessages(prevMessages => [...prevMessages, newMessage]);
        scrollToBottom(); // Yeni mesaj gönderildiğinde en alt kısmına kaydır
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });

    setMessage("");
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  }

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); // Ref'i kullanarak en alt kısmına kaydır
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header">
          <h4 className="card-title mb-0">Mesajlaşma Ekranı</h4>
          <small className="text-muted">Aktivite: {activityName}</small>
          <small className="text-muted">User: {senderName}</small>
          
        </div>
        <div className="card-body message-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.userId === userId ? 'sent' : 'received'}`}>
              <div className="content">{msg.messageContent}</div>
              <div className="meta">
                <span className="sender">{msg.senderDisplayName}</span>
                <span className="timestamp">{formatMessageDate(msg.messageSendDate)}</span>
              </div>
              {msg.userId === userId ? <div className="sender">Sen</div> : null}
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* Ref'i ekle */}
        </div>
        <div className="card-footer">
          <div className="input-group">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Arkadaşlarınla konuş" 
              value={message} 
              onChange={handleMessageChange} 
              onKeyDown={handleKeyDown} // Enter tuşunu dinle
            />
            <div className="input-group-append">
              <button 
                className="btn btn-primary" 
                type="button" 
                onClick={handleSendMessage}
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;
