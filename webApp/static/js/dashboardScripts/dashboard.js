function changeProfile(value){
    if (value !== ''){
        fetch('/ws/cfg/' + value, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(function(response) {
            response.json().then(function(res){
                if (!JSON.parse(res.ok)) {
                    alert(res.text)
                }else{
                    window.location.reload()
                }
            });
        });
    }
}