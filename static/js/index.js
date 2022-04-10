document.addEventListener('DOMContentLoaded', function(){
    const user_id = document.querySelector('#user_id');
    localStorage.setItem('user_id', user_id.innerHTML);
    active_chat.user_id = user_id.innerHTML;

    socket.emit('set_user_id', user_id.innerHTML);
});

var http = new XMLHttpRequest();
http.open('GET', '/get_messages');
http.onreadystatechange = function(){
    if(http.readyState==4 && http.status==200){
        var resp = http.responseText;
        resp = JSON.parse(resp);

        if(resp.status == 1){
            chats = resp.data;

            for(var item of chat_items){
                const chat_id = item.getAttribute('data-id');
                var message_id = -1;
                var last_message = null;
                for(var message of chats){
                    if(message.Emiter_id == chat_id || message.Receiver_id == chat_id){
                        if(message.Id > message_id){
                            message_id = message.Id;
                            last_message = message;
                        }
                    }
                }
                console.log(last_message);
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

for(var item of chat_items){
    item.addEventListener('click', function(e){
        e.preventDefault();
        init_page.hidden = true;
        chat_container.hidden = false;
        messages_container_section.innerHTML = null;
        const contact_id = this.getAttribute('data-id');
        console.log(contact_id);
        set_active_chat(contact_id);
        contact_selector.style.left = '-340px';
        sidenav_btn.style.left = '0px';
        hidden = true;

        const name = this.querySelector('.chat-item-name');
        chat_profile_img.innerHTML = name.childNodes[1].innerHTML[0];
        chat_name.innerHTML = name.innerHTML;

        console.log(chats);
        for(var i=0; i<chats.length; i++){
            if(chats[i].Emiter_id == contact_id || chats[i].Receiver_id == contact_id){
                const bubble = create_chat_item(chats[i]);
                messages_container_section.appendChild(bubble);
                messages_container_section.scrollTop = messages_container_section.scrollHeight;
            }
        }
    });
}

message_form.addEventListener('submit', function(e){
    e.preventDefault();

    var formData = new FormData(message_form);
    console.log(active_chat);
    formData.append('chat_object', JSON.stringify(active_chat));

    var http = new XMLHttpRequest();
    http.open('POST', '/send_message');
    http.onreadystatechange = function(){
        if(http.readyState==4 && http.status==200){
            var resp = http.responseText;
            resp = JSON.parse(resp);

            if(resp.status == 1){
                chats.push(resp.data);
                const bubble = create_chat_item(resp.data);
                messages_container_section.appendChild(bubble);
                messages_container_section.scrollTop = messages_container_section.scrollHeight;
                message_form.reset()

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