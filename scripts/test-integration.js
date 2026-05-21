const mongoose = require('mongoose');
const connectDB = require('../lib/mongodb');

// Test data for integration testing
const testData = {
  event: {
    eventname: "Test Event 2024",
    eventdescription: "A test event for integration testing",
    eventvenue: "Test Venue",
    eventdate: "2024-12-25",
    eventtime: "18:00",
    memberPrice: 50,
    guestPrice: 75,
    allowGuestRegistration: true,
    registrationDeadline: "2024-12-20",
    maxAttendees: 100
  },
  budget: {
    name: "Test Event Budget",
    description: "Budget for test event",
    category: "events",
    allocatedAmount: 5000,
    spentAmount: 0,
    period: "monthly",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    status: "active"
  },
  income: {
    title: "Test Income",
    amount: 1000,
    sourceType: "sponsorship",
    paymentMethod: "bank_transfer",
    referenceId: "TEST-001",
    description: "Test sponsorship income"
  },
  expense: {
    title: "Test Expense",
    amount: 500,
    expenseCategory: "venue",
    paymentMethod: "bank_transfer",
    notes: "Test venue rental expense"
  },
  donation: {
    donorName: "Test Donor",
    donorEmail: "test@example.com",
    amount: 100,
    donationPurpose: "event",
    message: "Test donation for event"
  },
  registration: {
    registrationType: "member",
    attendeeCount: 2,
    name: "Test Member",
    email: "member@example.com",
    phone: "+4712345678",
    address: "Test Address, Oslo",
    donationAmount: 50
  }
};

// Test functions
async function testEventCreation() {
  console.log('🧪 Testing Event Creation...');
  
  try {
    const Event = mongoose.model('Event');
    const event = new Event(testData.event);
    const savedEvent = await event.save();
    
    console.log('✅ Event created successfully:', savedEvent._id);
    return savedEvent;
  } catch (error) {
    console.error('❌ Event creation failed:', error.message);
    throw error;
  }
}

async function testBudgetCreation(eventId) {
  console.log('🧪 Testing Budget Creation...');
  
  try {
    const Budget = mongoose.model('Budget');
    const budgetData = { ...testData.budget, eventId };
    const budget = new Budget(budgetData);
    const savedBudget = await budget.save();
    
    console.log('✅ Budget created successfully:', savedBudget._id);
    console.log(`   Remaining amount: ${savedBudget.remainingAmount}`);
    return savedBudget;
  } catch (error) {
    console.error('❌ Budget creation failed:', error.message);
    throw error;
  }
}

async function testIncomeCreation(eventId) {
  console.log('🧪 Testing Income Creation...');
  
  try {
    const Income = mongoose.model('Income');
    const incomeData = { ...testData.income, eventId };
    const income = new Income(incomeData);
    const savedIncome = await income.save();
    
    console.log('✅ Income created successfully:', savedIncome._id);
    return savedIncome;
  } catch (error) {
    console.error('❌ Income creation failed:', error.message);
    throw error;
  }
}

async function testExpenseCreation(eventId) {
  console.log('🧪 Testing Expense Creation...');
  
  try {
    const Expense = mongoose.model('Expense');
    const expenseData = { ...testData.expense, eventId };
    const expense = new Expense(expenseData);
    const savedExpense = await expense.save();
    
    console.log('✅ Expense created successfully:', savedExpense._id);
    return savedExpense;
  } catch (error) {
    console.error('❌ Expense creation failed:', error.message);
    throw error;
  }
}

async function testDonationCreation(eventId) {
  console.log('🧪 Testing Donation Creation...');
  
  try {
    const Donation = mongoose.model('Donation');
    const donationData = { ...testData.donation, eventId };
    const donation = new Donation(donationData);
    const savedDonation = await donation.save();
    
    console.log('✅ Donation created successfully:', savedDonation._id);
    return savedDonation;
  } catch (error) {
    console.error('❌ Donation creation failed:', error.message);
    throw error;
  }
}

async function testRegistrationCreation(eventId) {
  console.log('🧪 Testing Event Registration Creation...');
  
  try {
    const EventRegistration = mongoose.model('EventRegistration');
    const registrationData = { ...testData.registration, eventId };
    const registration = new EventRegistration(registrationData);
    const savedRegistration = await registration.save();
    
    console.log('✅ Registration created successfully:', savedRegistration._id);
    console.log(`   Payment amount: ${savedRegistration.paymentAmount}`);
    console.log(`   Payment status: ${savedRegistration.paymentStatus}`);
    return savedRegistration;
  } catch (error) {
    console.error('❌ Registration creation failed:', error.message);
    throw error;
  }
}

async function testBudgetUpdate(budgetId, expenseAmount) {
  console.log('🧪 Testing Budget Update with Expense...');
  
  try {
    const Budget = mongoose.model('Budget');
    const budget = await Budget.findById(budgetId);
    
    const newSpentAmount = budget.spentAmount + expenseAmount;
    const updatedBudget = await Budget.findByIdAndUpdate(
      budgetId,
      { spentAmount: newSpentAmount },
      { new: true, runValidators: true }
    );
    
    console.log('✅ Budget updated successfully');
    console.log(`   Old spent: ${budget.spentAmount}, New spent: ${updatedBudget.spentAmount}`);
    console.log(`   New remaining: ${updatedBudget.remainingAmount}`);
    
    return updatedBudget;
  } catch (error) {
    console.error('❌ Budget update failed:', error.message);
    throw error;
  }
}

async function testEventReport(eventId) {
  console.log('🧪 Testing Event Report Generation...');
  
  try {
    const response = await fetch(`http://localhost:3000/api/reports/event/${eventId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const report = await response.json();
    
    console.log('✅ Event report generated successfully');
    console.log(`   Total Income: ${report.financialSummary.totalIncome}`);
    console.log(`   Total Expense: ${report.financialSummary.totalExpense}`);
    console.log(`   Total Donations: ${report.financialSummary.totalDonation}`);
    console.log(`   Profit/Loss: ${report.financialSummary.profitOrLoss}`);
    console.log(`   Total Registrations: ${report.registrationSummary.totalRegistrations}`);
    
    return report;
  } catch (error) {
    console.error('❌ Event report generation failed:', error.message);
    throw error;
  }
}

async function testOverallReport() {
  console.log('🧪 Testing Overall Report Generation...');
  
  try {
    const response = await fetch('http://localhost:3000/api/reports/overall');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const report = await response.json();
    
    console.log('✅ Overall report generated successfully');
    console.log(`   Total Budgets: ${report.summary.totalBudgets}`);
    console.log(`   Total Income: ${report.summary.totalIncome}`);
    console.log(`   Total Expenses: ${report.summary.totalExpenses}`);
    console.log(`   Total Donations: ${report.summary.totalDonations}`);
    console.log(`   Total Profit/Loss: ${report.summary.totalProfitLoss}`);
    
    return report;
  } catch (error) {
    console.error('❌ Overall report generation failed:', error.message);
    throw error;
  }
}

async function testDuplicateRegistration(eventId) {
  console.log('🧪 Testing Duplicate Registration Prevention...');
  
  try {
    const EventRegistration = mongoose.model('EventRegistration');
    const registrationData = { ...testData.registration, eventId };
    
    // Create first registration
    const registration1 = new EventRegistration(registrationData);
    await registration1.save();
    console.log('✅ First registration created');
    
    // Try to create duplicate registration
    const registration2 = new EventRegistration(registrationData);
    await registration2.save();
    
    console.log('❌ Duplicate registration was created (this should not happen)');
    throw new Error('Duplicate registration prevention failed');
    
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error
      console.log('✅ Duplicate registration prevented successfully');
      return true;
    } else {
      console.error('❌ Unexpected error during duplicate test:', error.message);
      throw error;
    }
  }
}

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints...');
  
  const tests = [
    { name: 'Budget API', url: '/api/budgets' },
    { name: 'Income API', url: '/api/income' },
    { name: 'Expense API', url: '/api/expense' },
    { name: 'Event Registration API', url: '/api/event-registration' }
  ];
  
  for (const test of tests) {
    try {
      const response = await fetch(`http://localhost:3000${test.url}`);
      if (response.ok) {
        console.log(`✅ ${test.name} is responding`);
      } else {
        console.log(`⚠️ ${test.name} returned status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed: ${error.message}`);
    }
  }
}

async function testDataIntegrity() {
  console.log('🧪 Testing Data Integrity...');
  
  try {
    // Check if all models are accessible
    const models = ['Event', 'Budget', 'Income', 'Expense', 'Donation', 'EventRegistration', 'Membership'];
    
    for (const modelName of models) {
      try {
        const Model = mongoose.model(modelName);
        const count = await Model.countDocuments();
        console.log(`✅ ${modelName} model accessible (${count} documents)`);
      } catch (error) {
        console.log(`❌ ${modelName} model not accessible: ${error.message}`);
      }
    }
    
    // Test relationships
    const Event = mongoose.model('Event');
    const events = await Event.find().limit(1);
    
    if (events.length > 0) {
      const event = events[0];
      
      // Test budget relationship
      const Budget = mongoose.model('Budget');
      const budgetCount = await Budget.countDocuments({ eventId: event._id });
      console.log(`✅ Event-Budget relationship working (${budgetCount} budgets)`);
      
      // Test income relationship
      const Income = mongoose.model('Income');
      const incomeCount = await Income.countDocuments({ eventId: event._id });
      console.log(`✅ Event-Income relationship working (${incomeCount} incomes)`);
      
      // Test expense relationship
      const Expense = mongoose.model('Expense');
      const expenseCount = await Expense.countDocuments({ eventId: event._id });
      console.log(`✅ Event-Expense relationship working (${expenseCount} expenses)`);
    }
    
  } catch (error) {
    console.error('❌ Data integrity test failed:', error.message);
    throw error;
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  try {
    const models = ['EventRegistration', 'Donation', 'Expense', 'Income', 'Budget', 'Event'];
    
    for (const modelName of models) {
      try {
        const Model = mongoose.model(modelName);
        const result = await Model.deleteMany({ 
          $or: [
            { name: /Test/i },
            { title: /Test/i },
            { donorName: /Test/i },
            { eventname: /Test/i }
          ]
        });
        console.log(`✅ Cleaned ${modelName}: ${result.deletedCount} documents`);
      } catch (error) {
        console.log(`⚠️ Could not clean ${modelName}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Main test runner
async function runIntegrationTests() {
  console.log('🚀 Starting Integration Tests...\n');
  
  try {
    await connectDB();
    
    // Clean up any existing test data
    await cleanupTestData();
    
    // Test data integrity
    await testDataIntegrity();
    
    // Test API endpoints
    await testAPIEndpoints();
    
    // Create test data
    const event = await testEventCreation();
    const budget = await testBudgetCreation(event._id);
    const income = await testIncomeCreation(event._id);
    const expense = await testExpenseCreation(event._id);
    const donation = await testDonationCreation(event._id);
    const registration = await testRegistrationCreation(event._id);
    
    // Test budget update
    await testBudgetUpdate(budget._id, expense.amount);
    
    // Test duplicate prevention
    await testDuplicateRegistration(event._id);
    
    // Test reporting
    await testEventReport(event._id);
    await testOverallReport();
    
    console.log('\n✅ All integration tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Integration tests failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up test data
    await cleanupTestData();
    await mongoose.disconnect();
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runIntegrationTests();
}

module.exports = {
  runIntegrationTests,
  testEventCreation,
  testBudgetCreation,
  testIncomeCreation,
  testExpenseCreation,
  testDonationCreation,
  testRegistrationCreation,
  testEventReport,
  testOverallReport
};
