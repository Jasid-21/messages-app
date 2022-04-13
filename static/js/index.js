document.addEventListener('DOMContentLoaded', function(){
    var http = new XMLHttpRequest();
    http.open('GET', '/get_contacts');
    http.onreadystatechange = function(){
        if(http.readyState==4 && http.status==200){
            var resp = http.responseText;
            resp = JSON.parse(resp);

            const user_id = resp.user_id;
            contacts = resp.contacts;

            localStorage.setItem('user_id', user_id);
            socket.emit('set_user_id', user_id);

            get_messages();
        }else{
            handle_http(http);
        }
    }
    http.send(null);
});

function get_messages(){
    var http = new XMLHttpRequest();
    http.open('GET', '/get_messages');
    http.onreadystatechange = function(){
        if(http.readyState==4 && http.status==200){
            var resp = http.responseText;
            resp = JSON.parse(resp);

            if(resp.status == 1){
                general_messages = resp.data;

                for(var contact of contacts){
                    for(var message of general_messages){
                        if(contact.Id == message.Emiter_id || contact.Id == message.Receiver_id){
                            const chatlist_item = create_chatlist_item(contact.Id, contact.Name);
                            chatlist_container.appendChild(chatlist_item);
                            contact.active = true;
                            break;
                        }
                    }
                }

                const chat_items = document.querySelectorAll('.chat-item');
                for(var item of chat_items){
                    const chat_id = item.getAttribute('data-id');
                    var message_id = -1;
                    var last_message = null;
                    for(var message of general_messages){
                        if(message.Emiter_id == chat_id || message.Receiver_id == chat_id){
                            if(message.Id > message_id){
                                message_id = message.Id;
                                last_message = message;
                            }
                        }
                    }
                    item.querySelector('.chat-last_msg-container').innerHTML = last_message?last_message.Message:null;
                }
            }else{
                alert(resp.message);
            }
        }else{
            handle_http(http);
        }
    }
    http.send(null);
}

message_form.addEventListener('submit', function(e){
    e.preventDefault();

    var formData = new FormData(message_form);
    formData.append('chat_object', JSON.stringify(active_chat));

    var http = new XMLHttpRequest();
    http.open('POST', '/send_message');
    http.onreadystatechange = function(){
        if(http.readyState==4 && http.status==200){
            var resp = http.responseText;
            resp = JSON.parse(resp);

            if(resp.status == 1){
                general_messages.push(resp.data);
                const bubble = create_chat_item(resp.data);
                messages_container_section.appendChild(bubble);
                messages_container_section.scrollTop = messages_container_section.scrollHeight;
                message_form.reset()

                const chat_items = document.querySelectorAll('.chat-item');
                for(var item of chat_items){
                    const chat_id = item.getAttribute('data-id');
                    if(chat_id == resp.data.Emiter_id || chat_id == resp.data.Receiver_id){
                        item.querySelector('.chat-last_msg-container').innerHTML = resp.data.Message;
                        break;
                    }
                }
            }
        }else{
            handle_http(http);
        }
    }
    http.send(formData);
});

logout_option.addEventListener('click', function(e){
    e.preventDefault();

    var http = new XMLHttpRequest();
    http.open('GET', '/logout');
    http.onreadystatechange = function(){
        if(http.readyState==4 && http.status==200){
            localStorage.removeItem('user_id');
            document.cookie = "";
            window.location.replace('/login');
        }else{
            handle_http(http);
        }
    }
    http.send(null);
});