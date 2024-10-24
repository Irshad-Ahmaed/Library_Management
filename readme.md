# Library Management System

This is a **Library Management System** built using Flask for the backend and MongoDB for database management. The frontend is a simple HTML/JS application, and JWT-based authentication is used for role-based access.

## live Link:
http://13.60.213.255:5000
 - hosted on AWS

    ### Steps followed to host in AWS:
    Create an EC2 Instance ('Ubuntu Free Tier' in my case).
    After creating EC2 Instance Connect it.
    After Connect Console of EC2 Instance appear.
    put below command one by one to install dependencies:
        sudo apt update
        sudo apt upgrade -y
        sudo apt install python3-pip python3-venv nginx tmux -y

    Now Clone the repository::
    - git clone https://github.com/Irshad-Ahmaed/Library_Management.git
    - cd Library_Management

    ### Set Up Virtual Environment:
    Create and activate the virtual environment:
    - python3 -m venv venv
    - source venv/bin/activate
    
    Install dependencies:
    - pip install -r requirements.txt

    ### Configure tmux for Running the App in the Background
    Use tmux to keep your app running after you disconnect from SSH:
    Start a new tmux session:
    - tmux new -s library_management

    Run the app using nohup: Inside your tmux session:
    - nohup flask run --host=0.0.0.0 --port=5000 &

    This will run the Flask app on 0.0.0.0 (all interfaces), allowing it to be accessed via your public IP.

    - Detach from tmux:
        Ctrl+b then press d
    - If want to re-attach the tmux session later:
        tmux attach -t library_management

    ### Set Up Nginx to Reverse Proxy to Flask
        Configure Nginx: Create a new Nginx site configuration file:
        - sudo nano /etc/nginx/sites-available/library_management

        - Add the following content to proxy requests to Flask:
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

        - Enable the configuration:
        ```sh
            sudo ln -s /etc/nginx/sites-available/library_management /etc/nginx/sites-enabled

        - Test and restart Nginx:








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