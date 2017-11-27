console.log('Loaded app js');
let command = document.getElementById('command');


document.addEventListener('keypress', (event) => {
    const keyName = event.key;
    console.log("keyname", keyName);
});
