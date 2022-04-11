new_contact_form.addEventListener('submit', function(e){
    e.preventDefault();

    const formData = new FormData(new_contact_form);
    
    var http = new XMLHttpRequest();
    http.open('POST', '/new_contact');
    http.onreadystatechange = function(){
        if(http.readyState==4 && http.status==200){
            alert_messages.classList.remove('negative', 'neutral', 'inactive');
            alert_messages.classList.add('positive');
        }else{
            handle_http(http);
        }
    }
    http.send(formData);
});

new_contact_cancel_btn.addEventListener('click', function(e){
    e.preventDefault();

    new_contact_form.reset();
    new_contact_form.style.top = '-500px';
});

new_contact_option.addEventListener('click', function(e){
    e.preventDefault();

    new_contact_contacts_container.innerHTML = null;
    for(var contact of contacts){
        const contact_item = document.createElement('div');
        contact_item.classList.add('contact-item');
            const contact_item_name = document.createElement('div');
            contact_item_name.classList.add('contact-item-name');
            contact_item_name.innerHTML = contact.Name;
        contact_item.appendChild(contact_item_name);

        new_contact_contacts_container.appendChild(contact_item);
    }

    new_chat_window.style.top = '-500px';
    new_contact_form.style.top = '20px';
});