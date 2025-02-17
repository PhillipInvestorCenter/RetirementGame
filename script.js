document.addEventListener('DOMContentLoaded', function(){
  const pages = document.querySelectorAll('.page');

  // Utility: Show page by ID and auto-focus first input if exists
  function showPage(pageId) {
    pages.forEach(page => {
      page.style.display = (page.id === pageId) ? 'block' : 'none';
    });
    const currentPage = document.getElementById(pageId);
    const input = currentPage.querySelector('input[type="text"]');
    if (input) {
      input.focus();
    }
  }

  // Debug: Confirm start button listener
  const startBtn = document.getElementById('startBtn');
  if(startBtn) {
    startBtn.addEventListener('click', function(){
      console.log("Start button clicked");
      showPage('page2');
    });
  } else {
    console.error("startBtn not found!");
  }

  // Validation function for current page
  function validateCurrentPage() {
    const currentPage = Array.from(pages).find(page => page.style.display !== "none");
    if (!currentPage) return true;
    const id = currentPage.id;
    if (id === "page2") {
      const val = document.getElementById('currentAge').value.trim();
      if (!val) {
        alert("กรุณากรอกอายุของคุณ");
        document.getElementById('currentAge').focus();
        return false;
      }
    }
    if (id === "page3") {
      const val = document.getElementById('retireAge').value.trim();
      if (!val) {
        alert("กรุณากรอกอายุที่คุณคาดว่าจะเกษียณ");
        document.getElementById('retireAge').focus();
        return false;
      }
    }
    if (id === "page4") {
      const val = document.getElementById('monthlyExpense').value.trim();
      if (!val) {
        alert("กรุณากรอกจำนวนเงินที่คาดว่าจะใช้ต่อเดือนหลังเกษียณ");
        document.getElementById('monthlyExpense').focus();
        return false;
      }
    }
    if (id === "page5") {
      const healthcareChoice = document.querySelector('input[name="healthcare"]:checked');
      if (healthcareChoice && healthcareChoice.value === "add") {
        const val = document.getElementById('healthExtra').value.trim();
        if (!val) {
          alert("กรุณากรอกจำนวนเงินสำหรับค่ารักษาพยาบาล");
          document.getElementById('healthExtra').focus();
          return false;
        }
      }
    }
    return true;
  }

  // Override Next button behavior to validate input before proceeding
  document.querySelectorAll('.nextBtn').forEach(btn => {
    btn.addEventListener('click', function(e){
      if (!validateCurrentPage()) {
        e.stopPropagation();
        return;
      }
      const nextPage = btn.getAttribute('data-next');
      if(nextPage) showPage(nextPage);
    });
  });

  // Back button navigation
  document.querySelectorAll('.backBtn').forEach(btn => {
    btn.addEventListener('click', function(){
      const backPage = btn.getAttribute('data-back');
      if(backPage) showPage(backPage);
    });
  });

  // Trigger next on Enter key for text inputs
  document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('keydown', function(e){
      if(e.key === "Enter"){
        if (!validateCurrentPage()) {
          e.preventDefault();
          return;
        }
        const currentPage = Array.from(pages).find(page => page.style.display !== "none");
        if(currentPage){
          const nextBtn = currentPage.querySelector('.nextBtn');
          if(nextBtn){
            nextBtn.click();
            e.preventDefault();
          }
        }
      }
    });
  });

  // Format numeric inputs with commas
  function addCommaFormatting(element) {
    element.addEventListener('input', function(e) {
      let value = e.target.value.replace(/,/g, '').replace(/\D/g, '');
      if (value === '') {
        e.target.value = '';
        return;
      }
      e.target.value = Number(value).toLocaleString('en-US');
    });
  }
  ['currentAge', 'retireAge', 'monthlyExpense', 'healthExtra'].forEach(id => {
    const input = document.getElementById(id);
    if(input) addCommaFormatting(input);
  });

  // Page 5: Show/hide extra healthcare cost input
  const healthcareRadios = document.getElementsByName('healthcare');
  Array.from(healthcareRadios).forEach(radio => {
    radio.addEventListener('change', function(){
      document.getElementById('healthInput').style.display = (this.value === 'add') ? 'block' : 'none';
    });
  });

  // Global variable for adjusted monthly expense
  let adjustedExpense = 0;

  // Calculate adjusted monthly expense based on healthcare choice
  function calculateAdjustedExpense() {
    const currentAge = Number(document.getElementById('currentAge').value.replace(/,/g, ''));
    const retireAge = Number(document.getElementById('retireAge').value.replace(/,/g, ''));
    let baseExpense = Number(document.getElementById('monthlyExpense').value.replace(/,/g, ''));
    
    // Add healthcare extra if chosen
    const healthcareChoice = document.querySelector('input[name="healthcare"]:checked');
    if(healthcareChoice && healthcareChoice.value === 'add'){
      const healthExtra = Number(document.getElementById('healthExtra').value.replace(/,/g, ''));
      baseExpense += healthExtra;
    }
    adjustedExpense = baseExpense;
  }
  document.getElementById('inflationNext').addEventListener('click', calculateAdjustedExpense);

  // Calculate required retirement fund on Page 7 using annuity FV formula with inflation rate 2.12%
  function calculateRequiredFund() {
    const retireAge = Number(document.getElementById('retireAge').value.replace(/,/g, ''));
    const yearsRetired = 83 - retireAge;
    const N = yearsRetired * 12;
    const i = 0.0212 / 12; // 2.12% annual inflation => monthly
    const requiredFund = adjustedExpense * ((Math.pow(1 + i, N) - 1) / i);
    const requiredString = requiredFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    document.getElementById('resultRequired').innerHTML =
      "เงินที่คุณต้องใช้หลังเกษียณ: <span class='highlight'>" + requiredString + "</span> บาท";
  }
  document.getElementById('calcNext').addEventListener('click', calculateRequiredFund);

  // Final page: Display summary message on Page 8
  function displayFinalMessage() {
    const finalMsg = document.getElementById('resultRequired').innerHTML;
    const message = finalMsg + "<br><br>" +
      "หากคุณต้องการวางแผนเก็บเงินเพิ่ม กรุณาตรวจสอบแผน Smart Plan ของเรา";
    document.getElementById('finalMessage').innerHTML = message;
  }
  document.getElementById('calcNext').addEventListener('click', displayFinalMessage);

  // Restart flow
  document.getElementById('restartBtn').addEventListener('click', function(){
    location.reload();
  });
});
