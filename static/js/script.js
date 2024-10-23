// Signup form submission
document.getElementById('signupForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, role })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.error);
        if (data.message === "Signup successful") {
            window.location.href = '/login';  // Redirect to login
        }
    })
    .catch(error => console.error('Error:', error));
});

// Login form submission
document.getElementById('loginForm')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            // Store the JWT token in localStorage
            localStorage.setItem('access_token', data.access_token);
            alert(data.message);
            
            // Redirect to dashboard
            // window.location.href = '/dashboard';
            fetchDashboard();
        } else {
            alert(data.error);
        }
    })
    .catch(error => console.error('Error:', error));
});

// Call to fetch dashboard
if (window.location.pathname === '/dashboard') {
    fetchMembers();
}

// Fetch the dashboard only if the user is logged in
function fetchDashboard() {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        // If no token, redirect to login
        window.location.href = '/login';
        return;
    }

    fetch('/dashboard', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (response.ok) {
            return response.text(); // Return the HTML content of dashboard
        } else {
            throw new Error('Unauthorized access. Redirecting to login.');
        }
    })
    .then(html => {
        document.body.innerHTML = html;
    })
    .catch(error => {
        console.error(error);
        window.location.href = '/login';
    });
}

// Logout function
function logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/login'; // Redirect to login after logout
}

// Delete Account
function deleteAccount() {
    fetch('/delete-account', {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.msg);
        localStorage.removeItem('access_token');  // Clear JWT token
        window.location.href = '/signup';  // Redirect to sign up page
    })
    .catch(error => console.error('Error deleting account:', error));
}

// -------------- Librarian Members Access -----------------

function fetchMembers() {
    fetch('/books', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        const memberTable = document.getElementById('memberTable').getElementsByTagName('tbody')[0];
        memberTable.innerHTML = '';  // Clear previous rows
         // Check if books data exists and is an array
         if (Array.isArray(data)) {
            data.forEach(member => {
                let row = memberTable.insertRow();
                row.innerHTML = `
                    <td>${member.title}</td>
                    <td>${member.status}</td>
                    <td>
                        <button onclick="deleteMember('${member.id}')">Delete</button>
                    </td>
                `;
            });
        } else {
            console.error('Books data is not an array:', data);
        }
    })
    .catch(error => console.error('Error fetching books:', error));
}

// Fetch and display members list (Librarian Only)
function fetchMembers() {
    fetch('/members', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        const memberTable = document.getElementById('memberTable').getElementsByTagName('tbody')[0];
        data.forEach(member => {
            let row = memberTable.insertRow();
            row.innerHTML = `
                <td>${member.username}</td>
                <td>${member.role}</td>
                <td>
                    <button onclick="deleteMember('${member.id}')">Delete</button>
                    <button onclick="updateMember('${member.id}')">Update</button>
                </td>
            `;
        });
    })
    .catch(error => console.error('Error fetching members:', error));
}

// Add new member (Librarian Only)
document.getElementById('addMemberForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    fetch('/members', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        },
        body: JSON.stringify({ username, password, role })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.msg);
        window.location.reload();  // Reload the page to update the member list
    })
    .catch(error => console.error('Error adding member:', error));
});

// Update member (Librarian Only)
function updateMember(memberId) {
    const username = prompt('Enter new username');
    const role = prompt('Enter new role (MEMBER/LIBRARIAN)');

    fetch(`/members/${memberId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        },
        body: JSON.stringify({ username, role })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.msg);
        window.location.href = '/manage_members';  // Reload the page to update the member list
    })
    .catch(error => console.error('Error updating member:', error));
}

// Delete a member (Librarian Only)
function deleteMember(memberId) {
    fetch(`/members/${memberId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.msg);
        window.location.reload();  // Reload the page to update the member list
    })
    .catch(error => console.error('Error deleting member:', error));
}

// Call to fetch Members when the Members list page loads
if (window.location.pathname === '/manage_members') {
    fetchMembers();
}

// --------------- Common Access --------------------
// Fetch and display book list
function fetchBooks() {
    fetch('/books', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        const bookTable = document.getElementById('bookTable').getElementsByTagName('tbody')[0];
        bookTable.innerHTML = '';  // Clear previous rows
         // Check if books data exists and is an array
         if (Array.isArray(data)) {
            data.forEach(book => {
                let row = bookTable.insertRow();
                row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.status}</td>
                    <td>
                        <button onclick="deleteBook('${book.id}')">Delete</button>
                        <button onclick="borrowBook('${book.id}')">Borrow</button>
                        <button onclick="returnBook('${book.id}')">Return</button>
                    </td>
                `;
            });
        } else {
            console.error('Books data is not an array:', data);
        }
    })
    .catch(error => console.error('Error fetching books:', error));
}

// --------------- Librarian Books Access -------------

// Add new book
document.getElementById('addBookForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;

    fetch('/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        },
        body: JSON.stringify({ title, author })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.msg);
        window.location.href = '/book_list';  // Redirect to book list
        fetchBooks();
    })
    .catch(error => console.error('Error adding book:', error));
});

// Delete a book
function deleteBook(bookId) {
    fetch(`/books/${bookId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Book deleted successfully.');
            window.location.reload();  // Reload the page to update the book list
        } else {
            alert('Error deleting book.');
        }
    })
    .catch(error => console.error('Error deleting book:', error));
}

// Edit a book
function editBook(bookId) {
    const newTitle = prompt('Enter the new title:');
    const newAuthor = prompt('Enter the new author:');
    if (newTitle && newAuthor) {
        fetch(`/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({ title: newTitle, author: newAuthor })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.msg);
            window.location.reload();  // Reload the page to reflect changes
        })
        .catch(error => console.error('Error updating book:', error));
    }
}

// Call to fetch books when the book list page loads
if (window.location.pathname === '/book_list') {
    fetchBooks();
}

// -------------------- Members Books Access ---------------------

// Borrow a book
function borrowBook(bookId) {
    fetch(`/books/borrow/${bookId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.msg);
        window.location.reload(); // Refresh the page to update the book list
    })
    .catch(error => console.error('Error borrowing book:', error));
}

// Return a book
function returnBook(bookId) {
    fetch(`/books/return/${bookId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.msg);
        window.location.reload(); // Refresh the page to update the book list
    })
    .catch(error => console.error('Error returning book:', error));
}
