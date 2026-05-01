// Simple test to check if the birthdays API is working correctly
fetch('http://localhost:3000/api/membership/upcoming-birthdays')
    .then(response => response.json())
    .then(data => {
        console.log('API Response:', data);
        console.log('Success:', data.success);
        console.log('Count:', data.count);
        console.log('Data length:', data.data?.length);
        
        if (data.data && data.data.length > 0) {
            console.log('First birthday:', data.data[0]);
            console.log('Member name:', data.data[0].fullName);
            console.log('Personal number:', data.data[0].personalNumber);
            console.log('Days until birthday:', data.data[0].daysUntilBirthday);
        } else {
            console.log('No birthdays found');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
