socket.on('message', function(message){
    console.log(message);
    general_messages.push(message);
    if(active_chat.chat_id == message.Emiter_id){
        const bubble = create_chat_item(message);
        messages_container_section.appendChild(bubble);
        messages_container_section.scrollTop = messages_container_section.scrollHeight;
    }
    console.log('line 09');

    const chat_items = document.querySelectorAll('.chat-item');
    for(var item of chat_items){
        const chat_id = item.getAttribute('data-id');
        if(chat_id == message.Emiter_id || chat_id == message.Receiver_id){
            item.querySelector('.chat-last_msg-container').innerHTML = message.Message;
            break;
        }
    }
});