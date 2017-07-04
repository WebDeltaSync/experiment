# Web Delta Srync experiment

### /random_modify: Some scripts to generate and modify files

> generate_file.py:  Generate random files
> 
> insert_modify.py:  Insert a random blob into file in a random position.
> 
> append_modify.py: Append a random blob after file
> 
> delete_modify.py: Delete a random range from file in a random position.
> 


### /virtual_clients: Scripts to simulate multi clients for throughput tests

> virtual_client_webRsync.py: You can see it as a client in browser. WebRsync

> virtual_client_webR2sync.js: You can see it as a client in browser. WebRsync

How to run it:

Use a package called concurrently.

> npm i concurrently --save-dev

Then setup your npm run dev task as so:

> "dev": "concurrently --kill-others \"npm run virtual_client_webRsync\"

### Link for locality test: (from Quanlu Zhang):
<https://github.com/QuanluZhang/DeltaCFS/tree/master/trace>




