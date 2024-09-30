<template>
  <div class="home-container">
    <!-- Hero Section -->
    <div class="hero-section">
      <img src="@/assets/eaIcon.png" alt="App Icon" class="app-icon" />
      <h1>Expense Analyser</h1>
      <p class="subtitle">Your one-stop solution for managing bills in one place.</p>
      <p class="next">Register or Login to Continue</p>
      <div class="button-group">
        <router-link to="/login">
          <button class="btn login-btn">Login</button>
        </router-link>
        <router-link to="/register">
          <button class="btn register-btn">Register</button>
        </router-link>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <h2>Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <img src="@/assets/eaUploadIcon.png" alt="Upload Receipts" />
          <h3>Upload Bills</h3>
          <p>Easily manage and organize all your bills in one place.</p>
        </div>
        <div class="feature-card">
          <img src="@//assets/eaProcessIcon.png" alt="Process Receipts" />
          <h3>Process Receipts</h3>
          <p>Process receipts and bills to extract total and other information.</p>
        </div>
        <div class="feature-card">
          <img src="@/assets/eaShareExpense.png" alt="Share Expense " />
          <h3>Share Expense</h3>
          <p>Share Expense With other app users.</p>
        </div>
      </div>
    </div>

    <!-- Testimonials Section -->
    <div class="testimonials-section">
      <h2>What Our Users Say</h2>
      <div class="testimonial">
        <p>"This app completely changed how I manage my work. Highly recommend!"</p>
        <span>- Alex P.</span>
      </div>
      <div class="testimonial">
        <p>"The collaborative features made team projects so much smoother. Love it!"</p>
        <span>- Taylor R.</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'eaHome'
})
</script>

<style scoped>
/* Ensure the container fills the whole viewport */
.home-container {
  display: flex;
  flex-direction: row;
  min-height: fit-content;
  width: 1300px;
}

/* Hero Section: Full-screen height for this section */
.hero-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  flex: 1;
  text-align: center;
}

.app-icon {
  width: 350px;
  height: auto;
  margin-bottom: 50px;
}

h1 {
  font-size: 36px;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 18px;
  margin-bottom: 30px;
}
.next {
  font-size: larger;
  font-style: italic;
  margin-bottom: 10px;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
}

.login-btn {
  background-color: #3498db;
  color: white;
}

.register-btn {
  background-color: #2ecc71;
  color: white;
}

.btn:hover {
  transform: translateY(-2px); /* Lift effect on hover */
}

/* Features Section */
.features-section {
  padding: 60px 20px;
}

.features-section h2 {
  font-size: 52px;
  margin-bottom: 30px;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-card {
  padding: 20px;
  background-color: #494a50; /* Light grey background for cards */
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(213, 30, 30, 0.1); /* Soft shadow effect */
  transition: transform 0.3s ease; /* Smooth hover transition */
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px); /* Lift effect on hover */
}

.feature-card img {
  width: 80px;
  height: auto;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 24px;
  margin-bottom: 10px;
  font-style: italic;
  font-weight: bolder;
}

/* Testimonials Section */
.testimonials-section {
  background-color: #494a50;
  padding: 20px 20px;
  text-align: center;
}

.testimonials-section h2 {
  font-size: 32px;
  margin-bottom: 30px;
}

.testimonial {
  margin-bottom: 20px;
  max-width: 400px; /* Limit width for readability */
  margin-left: 10px;
  margin-right: 0px; /* Center testimonials */
}

.testimonial p {
  font-size: 16px;
  font-style: italic;
  margin-bottom: 5px;
}

.testimonial span {
  font-size: 14px;
  color: #777;
}
</style>
