const stars = document.querySelectorAll('.stars i');
let selectedRating = 0;

// Highlight stars based on rating value
function highlightStars(rating) {
  stars.forEach((star, idx) => {
    if (idx < rating) {
      star.classList.add('selected');
    } else {
      star.classList.remove('selected');
    }
  });
}

// Add event listeners for star hover and click
stars.forEach(star => {
  star.addEventListener('mouseover', () => {
    const val = star.getAttribute('data-value');
    highlightStars(val);
  });
  star.addEventListener('mouseout', () => {
    highlightStars(selectedRating);
  });
  star.addEventListener('click', () => {
    selectedRating = star.getAttribute('data-value');
    highlightStars(selectedRating);
  });
});

// Escape HTML to avoid XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

const thankYouMessage = document.getElementById('thankYouMessage');
const ratingForm = document.getElementById('ratingForm');
const ratingsList = document.getElementById('ratingsList');

// Load ratings from backend API
async function loadRatings() {
  try {
    const res = await fetch('http://localhost:5000/api/ratings');
    if (!res.ok) throw new Error('Failed to fetch ratings');
    const ratings = await res.json();

    ratingsList.innerHTML = ''; // Clear existing

    ratings.forEach(r => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${escapeHtml(r.name)}</strong><br/>
        Rating: ${r.rating} Star${r.rating > 1 ? 's' : ''}<br/>
        <em>${escapeHtml(r.comment || '')}</em>
      `;
      ratingsList.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading ratings:', error);
  }
}

// Handle form submission to backend
ratingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('username').value.trim();
  const comment = document.getElementById('comment').value.trim();

  if (selectedRating === 0) {
    alert("Please select a star rating.");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rating: selectedRating, comment })
    });

    if (!response.ok) {
      const err = await response.json();
      alert(err.message || 'Failed to submit rating');
      return;
    }

    thankYouMessage.textContent = "Thank you for rating us!";
    thankYouMessage.style.display = 'block';

    ratingForm.reset();
    highlightStars(0);
    selectedRating = 0;

    // Refresh the ratings list
    loadRatings();

    // Hide thank you message after 3 seconds
    setTimeout(() => {
      thankYouMessage.style.display = 'none';
    }, 3000);

  } catch (err) {
    alert('Error submitting rating: ' + err.message);
  }
});

// Initial load of ratings on page load
loadRatings();

