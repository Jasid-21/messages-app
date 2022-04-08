login_dir.addEventListener('click', function(e){
    e.preventDefault();

    signup_form.hidden = true;
    login_form.hidden = false;
});

signup_dir.addEventListener('click', function(e){
    e.preventDefault();

    login_form.hidden = true;
    signup_form.hidden = false;
});

signup_form.addEventListener('submit', function(e){
    e.preventDefault();

    const formData = new FormData(signup_form);
    var http = new XMLHttpRequest();
    http.open('POST', '/signup');
    http.onreadystatechange = function(){
        if(http.readyState==4 && http.status==200){
            var resp = http.responseText;
            resp = JSON.parse(resp);
            console.log(resp);

            if(resp.status == 1){
                window.location.replace('/');
            }else{
                alert(resp.message);
            }
        }else{
            handle_http(http);
        }
    }
    http.send(formData);
});

login_form.addEventListener('submit', function(e){
    e.preventDefault();

    const formData = new FormData(login_form);
    var http = new XMLHttpRequest();
    http.open('POST', '/login');
    http.onreadystatechange = function(){
        if(http.readyState==4 && http.status==200){
            var resp = http.responseText;
            resp = JSON.parse(resp);

            if(resp.status == 1){
                window.location.replace('/');
            }else{
                alert(resp.message);
            }
        }else{
            handle_http(http);
        }
    }
    http.send(formData);
});