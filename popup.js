document.addEventListener('DOMContentLoaded', function () {
  const bugsList = document.getElementById('bugs-list');
  //const errorMessage = document.getElementById('error-message');

  // Function to add a bug to the local storage
  function addBug(category, bug) {
    let bugsByCategory = JSON.parse(localStorage.getItem('bugsByCategory')) || {};
    bugsByCategory[category] = bugsByCategory[category] || [];
    bugsByCategory[category].push(bug);
    localStorage.setItem('bugsByCategory', JSON.stringify(bugsByCategory));
  }

  // Function to delete a bug from the local storage
  function deleteBug(category, bugIndex) {
    let bugsByCategory = JSON.parse(localStorage.getItem('bugsByCategory')) || {};
    bugsByCategory[category] = bugsByCategory[category] || [];
    bugsByCategory[category].splice(bugIndex, 1);
    localStorage.setItem('bugsByCategory', JSON.stringify(bugsByCategory));
  }

  // Function to display bugs in the popup
  function displayBugs() {
    bugsList.innerHTML = ''; // Clear the current list

    const bugsByCategory = JSON.parse(localStorage.getItem('bugsByCategory')) || {};

    for (const category in bugsByCategory) {
      const bugs = bugsByCategory[category];
      if (bugs.length > 0) {
        const table = document.createElement('table');
        const tableBody = document.createElement('tbody');
        table.appendChild(tableBody);

        const urlRow = document.createElement('tr');
        const tdURL = document.createElement('td');
        tdURL.colSpan = 2; // Span two columns for the URL cell


 urlRow.style.backgroundColor='#F8F8F8';

        // Create a hyperlink for the URL
        const urlLink = document.createElement('a');
        urlLink.href = category;
        urlLink.textContent = category;
        urlLink.target = '_blank'; // Open URL in a new tab

        // Add the click event to open the URL when clicked
        urlLink.addEventListener('click', function (event) {
          event.preventDefault();
          chrome.tabs.create({ url: category });
        });



        tdURL.appendChild(urlLink);
        urlRow.appendChild(tdURL);
        tableBody.appendChild(urlRow);

        const tableHeaderRow = document.createElement('tr');
        const thBugDescription = document.createElement('th');
        thBugDescription.textContent = 'Bug';
        //const thAction = document.createElement('th');
        //thAction.textContent = 'Act';
        //tableHeaderRow.appendChild(thBugDescription);
        //tableHeaderRow.appendChild(thAction);
        //tableBody.appendChild(tableHeaderRow);

        bugs.forEach((bug, index) => {
          const tableDataRow = document.createElement('tr');
          const tdBugDescription = document.createElement('td');
          tdBugDescription.textContent = bug;
          tableDataRow.classList.add('border-row');

          const tdDeleteButton = document.createElement('td');
          tdDeleteButton.innerHTML = '&#10006;'; // Unicode symbol for delete (✖)
          tdDeleteButton.style.cursor = 'pointer';
          tdDeleteButton.style.textAlign = 'center';
          tdDeleteButton.style.color = 'red';
          tdDeleteButton.addEventListener('click', function () {
            deleteBug(category, index);
            displayBugs(); // Refresh the list after deletion
          });

          tableDataRow.appendChild(tdBugDescription);
          tableDataRow.appendChild(tdDeleteButton);
          tableBody.appendChild(tableDataRow);
        });

        bugsList.appendChild(table);
      }
    }

    // Display message if no bugs found
    if (bugsList.innerHTML.trim() === '') {
      const noBugsMessage = document.createElement('p');
      noBugsMessage.textContent = 'No bugs found.';
      noBugsMessage.classList.add('no-bugs');
      bugsList.appendChild(noBugsMessage);
    }
  }

  // Function to get the URL of the currently active tab
  function getCurrentTabURL(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const url = tabs[0]?.url || '';
      callback(url);
    });
  }

  // Function to validate bug description
  function isValidDescription(description) {
    return description.trim().length >= 3;
  }

  // Initial display of bugs
  displayBugs();

  // Bug Report Form Submission
  const bugReportForm = document.getElementById('bugReportForm');

  bugReportForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const bugDescription = document.getElementById('bugDescription').value;
    if (!isValidDescription(bugDescription)) {
      //errorMessage.textContent = 'At least 10 characters.';
      return;
    } else {
      //errorMessage.textContent = ''; // Clear the error message if description is valid
    }

    getCurrentTabURL(function (url) {
      addBug(url, bugDescription);
      // Clear the input after adding the bug
      document.getElementById('bugDescription').value = '';
      // Update the bugs list in the popup
      displayBugs();
    });
  });
});
