from flask import Flask, request, jsonify, render_template
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
from bson import ObjectId

app = Flask(__name__)

# MongoDB Configuration
app.config["MONGO_URI"] = "mongodb+srv://IrshadBook:Irshad786@clusterflask.ujikz.mongodb.net/library-management?retryWrites=true&w=majority&appName=ClusterFlask"
mongo = PyMongo(app)

# JWT Configuration
app.config["JWT_SECRET_KEY"] = "your_jwt_secret_key"
jwt = JWTManager(app)

# ---------------- HTML Files Routes -------------------

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/signup')
def home_signup():
    return render_template('signup.html')

@app.route('/login')
def home_login():
    return render_template('login.html')

@app.route('/book_list')
def home_viewBooks():
    return render_template('book_list.html')

@app.route('/add_book')
def home_addBooks():
    return render_template('add_book.html')

@app.route('/manage_members')
def home_viewMembers():
    return render_template('manage_members.html')

@app.route('/add_member')
def home_addMember():
    return render_template('add_member.html')

# --------------------- Auth Section ----------------------------

# -- User Signup --
@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()

        if not data or 'username' not in data or 'password' not in data or 'role' not in data:
            return jsonify({"error": "Username, Password, and Role are required"}), 400

        username = data['username']
        password = data['password']
        role = data['role']

        existing_user = mongo.db.users.find_one({"username": username})
        if existing_user:
            return jsonify({"error": "Username already exists"}), 400

        hashed_password = generate_password_hash(password)
        mongo.db.users.insert_one({"username": username, "password": hashed_password, "role": role})

        return jsonify({"message": "Signup successful"}), 201

    except Exception as e:
        print(f"Error during signup: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# -- User Login --
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"error": "Username and Password are required"}), 400

        username = data['username']
        password = data['password']

        user = mongo.db.users.find_one({"username": username})
        if user and check_password_hash(user['password'], password):
            access_token = create_access_token(identity={"_id": str(user["_id"]), "username": username, "role": user['role']},
                                               expires_delta=datetime.timedelta(hours=1))
            return jsonify({"message": "Login successful", "access_token": access_token}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401

    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# After Login
@app.route('/dashboard')
@jwt_required()
def dashboard():
    current_user = get_jwt_identity()
    if current_user['role'] == 'LIBRARIAN':
        return render_template('dashboard.html')
    else:
        return render_template('member_dashboard.html')

# Logout
@app.route('/logout', methods=['POST'])
def logout():
    return jsonify({"msg": "Logged out successfully!"}), 200

# ---------------- For Members -------------
# Delete Own Account (Member Only)
@app.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    current_user = get_jwt_identity()
    
    # Make sure the _id is present in current_user
    if '_id' not in current_user:
        return jsonify({"msg": "User ID not found"}), 400
    
    user_id = current_user['_id']
    mongo.db.users.delete_one({"_id": ObjectId(user_id)})
    
    return jsonify({"msg": "Account deleted successfully"}), 200

# ----------- Common Access -------

# View Books
@app.route('/books', methods=['GET'])
@jwt_required()
def view_books():
    books = mongo.db.books.find()
    output = []
    for book in books:
        output.append({
            "id": str(book["_id"]),  # Convert ObjectId to string
            "title": book["title"],
            "author": book["author"],
            "status": book["status"]
        })
    return jsonify(output), 200

# -------------------- Librarian Books Access --------------

# Add a Book (Librarian Only)
@app.route('/books', methods=['POST'])
@jwt_required()
def add_book():
    current_user = get_jwt_identity()
    if current_user['role'] != 'LIBRARIAN':
        return jsonify({"msg": "Access denied."}), 403

    title = request.json.get('title')
    author = request.json.get('author')  # Include author
    if not title | author:
        return jsonify({"msg": "Title or author is missing."}), 400
    
    mongo.db.books.insert_one({"title": title, "author": author, "status": "AVAILABLE"})
    return jsonify({"msg": "Book added successfully!"}), 201

# Update Book
@app.route('/books/<id>', methods=['PUT'])
@jwt_required()
def update_book(id):
    title = request.json.get('title')
    author = request.json.get('author')  # Handle author as well
    mongo.db.books.update_one({"_id": ObjectId(id)}, {"$set": {"title": title, "author": author}})
    return jsonify({"msg": "Book updated successfully!"}), 200

# Delete Book
@app.route('/books/<id>', methods=['DELETE'])
@jwt_required()
def delete_book(id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'LIBRARIAN':
        return jsonify({"msg": "Access denied."}), 403

    mongo.db.books.delete_one({"_id": ObjectId(id)})
    return jsonify({"msg": "Book deleted successfully!"}), 200


# -------------------- Librarian Members Access --------------

# Add a Member (Librarian Only)
@app.route('/members', methods=['POST'])
@jwt_required()
def add_member():
    current_user = get_jwt_identity()
    if current_user['role'] != 'LIBRARIAN':
        return jsonify({"msg": "Access denied."}), 403

    username = request.json.get('username')
    password = request.json.get('password')  # Hashing should be applied here
    role = request.json.get('role')

    existing_user = mongo.db.users.find_one({"username": username})
    if existing_user:
        return jsonify({"error": "Username already exists"}), 400
    
    hashed_password = generate_password_hash(password)
    mongo.db.users.insert_one({"username": username, "password": hashed_password, "role": role})
    return jsonify({"message": "Member added successfully!"}), 201

# Update Member (Librarian Only)
@app.route('/members/<id>', methods=['PATCH'])
@jwt_required()
def update_member(id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'LIBRARIAN':
        return jsonify({"msg": "Access denied."}), 403

    username = request.json.get('username')
    role = request.json.get('role')

    mongo.db.users.update_one({"_id": ObjectId(id)}, {"$set": {"username": username, "role": role}})
    return jsonify({"msg": "Member updated successfully!"}), 200

# View Members (Librarian Only)
@app.route('/members', methods=['GET'])
@jwt_required()
def view_members():
    current_user = get_jwt_identity()
    if current_user['role'] != 'LIBRARIAN':
        return jsonify({"msg": "Access denied."}), 403

    members = mongo.db.users.find({"role": "MEMBER"})
    output = []
    for member in members:
        output.append({"id": str(member["_id"]), "username": member["username"], "role": member["role"]})
    return jsonify(output), 200

# Delete a Member (Librarian Only)
@app.route('/members/<id>', methods=['DELETE'])
@jwt_required()
def delete_member(id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'LIBRARIAN':
        return jsonify({"msg": "Access denied."}), 403

    mongo.db.users.delete_one({"_id": ObjectId(id)})
    return jsonify({"msg": "Member deleted successfully!"}), 200



# ---------------- Members Section -----------------

# Borrow a Book (Member Only)
@app.route('/books/borrow/<id>', methods=['PATCH'])
@jwt_required()
def borrow_book(id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'MEMBER':
        return jsonify({"msg": "Access denied."}), 403

    # Mark book as borrowed and save the borrower's information
    mongo.db.books.update_one(
        {"_id": ObjectId(id)}, 
        {"$set": {"status": "BORROWED", "borrowed_by": current_user['username']}}
    )

    return jsonify({"msg": "Book borrowed successfully!"}), 200

# Return a Book (Member Only)
@app.route('/books/return/<id>', methods=['PATCH'])
@jwt_required()
def return_book(id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'MEMBER':
        return jsonify({"msg": "Access denied."}), 403

    # Mark book as returned and remove the borrower info
    mongo.db.books.update_one(
        {"_id": ObjectId(id)}, 
        {"$set": {"status": "AVAILABLE"}, "$unset": {"borrowed_by": ""}}
    )

    return jsonify({"msg": "Book returned successfully!"}), 200



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
