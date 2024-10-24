# Library Management System

This is a **Library Management System** built using Flask for the backend and MongoDB for database management. The frontend is a simple HTML/JS application, and JWT-based authentication is used for role-based access.

# live Link:
http://13.60.213.255:5000
hosted on AWS

## Steps followed to host in AWS:
1. Create an EC2 Instance ('Ubuntu Free Tier' in my case).

2. After creating EC2 Instance Connect it.

3. After Connect Console of EC2 Instance appear.

4. **put below command one by one to install dependencies**:
    ```sh
        sudo apt update
        sudo apt upgrade -y
        sudo apt install python3-pip python3-venv nginx tmux -y

5. **Now Clone the repository:**
    ```sh
    git clone https://github.com/Irshad-Ahmaed/Library_Management.git
    cd Library_Management
    

### Set Up Virtual Environment:
1. **Create and activate the virtual environment**:
    ```sh
    python3 -m venv venv
    source venv/bin/activate

2.  **Install dependencies**:
    ```sh
    pip install -r requirements.txt

### Configure tmux for Running the App in the Background
Use tmux to keep your app running after you disconnect from SSH:
1.  **Start a new tmux session**:
    ```sh
    tmux new -s library_management

2. **Run the app using nohup: Inside your tmux session**:
    ```sh
    nohup flask run --host=0.0.0.0 --port=5000 &

This will run the Flask app on 0.0.0.0 (all interfaces), allowing it to be accessed via your public IP.

3. **Detach from tmux**:
    Ctrl+b then press d

4. **If want to re-attach the tmux session later**:
    ```sh
    tmux attach -t library_management

### Set Up Nginx to Reverse Proxy to Flask
1. Configure Nginx: Create a new Nginx site configuration file:
    ```sh
    sudo nano /etc/nginx/sites-available/library_management

2. Add the following content to proxy requests to Flask:
    ```sh
        server {
            listen 80;
            server_name <Public_IP>;

            location / {
                proxy_pass http://127.0.0.1:5000;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }

3. Enable the configuration:
    ```sh
        sudo ln -s /etc/nginx/sites-available/library_management /etc/nginx/sites-enabled

4. Test and restart Nginx:
    ```sh
    sudo nginx -t
    sudo systemctl restart nginx

Now your website should be live on your public  IP address. You can access it by visiting <http://Public_IP> in your web browser.

                -------------- Hosting Step End ---------------------


##   Database diagram representing relationships between tables:
https://drive.google.com/file/d/1IO1By98eNxyqMqSTqbVrB3QTCw2jqWvv/view?usp=drive_link

##   Flow of the Software:
https://docs.google.com/document/d/19kdQre41UA2_HE_SorKn8brEF8kUSaHb1zuvzfVapJE/edit?usp=sharing


## Project Setup

1. **Clone the Repository**
    ```sh
    git clone https://github.com/Irshad-Ahmaed/Library_Management.git
    cd library-management

2. **Set Up a Virtual Environment**
    ```sh
    python -m venv venv
    venv\Scripts\activate  # On Windows 

3. **Install the Dependencies**
    ```sh
    pip install -r requirements.txt

4. **Run the Project**
    ```sh
    flask run

- Project should now be running at http://127.0.0.1:5000/


## Table Structure & API Documentation
https://docs.google.com/document/d/1en4juWRdImtvgUXSKVXmJ4jdm_d8IBbCdnR8qYBcjho/edit?usp=sharing