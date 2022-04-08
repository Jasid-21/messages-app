socket.on('message', function(message){
    console.log(message);
    chats.push(message);
    const bubble = create_chat_item(message);
    messages_container_section.appendChild(bubble);
    message_form.reset()
});