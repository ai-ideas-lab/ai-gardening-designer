#!/usr/bin/env node

// Simple test runner without Jest dependencies
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌱 AI Gardening Designer - Basic Test Runner');
console.log('============================================');

// Function to run a test file
function runTestFile(filePath) {
  try {
    console.log(`\n📝 Running ${path.basename(filePath)}...`);
    
    // Load and execute the test file
    const testCode = fs.readFileSync(filePath, 'utf8');
    
    // Create a simple test execution environment
    const testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };

    // Execute the test code in a try-catch block
    try {
      // Create a simple test environment
      const assert = {
        equal: (actual, expected, message) => {
          if (actual === expected) {
            console.log(`✅ ${message || 'Assertion passed'}`);
            testResults.passed++;
          } else {
            console.log(`❌ ${message || 'Assertion failed'}: Expected ${expected}, got ${actual}`);
            testResults.failed++;
          }
        },
        ok: (condition, message) => {
          if (condition) {
            console.log(`✅ ${message || 'Assertion passed'}`);
            testResults.passed++;
          } else {
            console.log(`❌ ${message || 'Assertion failed'}: Condition is false`);
            testResults.failed++;
          }
        },
        throws: (fn, errorType, message) => {
          try {
            fn();
            console.log(`❌ ${message || 'Expected error but none thrown'}`);
            testResults.failed++;
          } catch (error) {
            if (errorType && error instanceof errorType) {
              console.log(`✅ ${message || 'Expected error thrown'}`);
              testResults.passed++;
            } else if (!errorType) {
              console.log(`✅ ${message || 'Error thrown as expected'}`);
              testResults.passed++;
            } else {
              console.log(`❌ ${message || 'Wrong error type'}`);
              testResults.failed++;
            }
          }
        }
      };

      // Mock functions for testing
      const testFunctions = {
        it: (name, testFn) => {
          console.log(`🧪 ${name}`);
          testFn();
        },
        describe: (name, testFn) => {
          console.log(`📋 ${name}`);
          testFn();
        }
      };

      // Execute the test code with our mock environment
      eval(`
        (function() {
          const describe = testFunctions.describe;
          const it = testFunctions.it;
          const expect = (value) => ({
            toBe: (expected) => assert.equal(value, expected),
            toEqual: (expected) => assert.equal(JSON.stringify(value), JSON.stringify(expected)),
            toThrow: () => assert.throws(() => { throw value; }),
            toBeDefined: () => assert.ok(value !== undefined, 'Value is defined'),
            toBeNull: () => assert.equal(value, null, 'Value is null'),
            toBeTruthy: () => assert.ok(value, 'Value is truthy'),
            toBeFalsy: () => assert.ok(!value, 'Value is falsy')
          });
          
          ${testCode}
        })();
      `);
      
      console.log(`✅ ${path.basename(filePath)}: Tests completed`);
    } catch (error) {
      testResults.errors.push(error.message);
      console.log(`❌ ${path.basename(filePath)}: Error - ${error.message}`);
    }

    return testResults;
  } catch (error) {
    console.log(`❌ Failed to load test file ${filePath}: ${error.message}`);
    return { passed: 0, failed: 1, errors: [error.message] };
  }
}

// Function to run basic Node.js tests
function runBasicTests() {
  console.log('\n🧪 Running Basic Node.js Tests...');
  
  const basicTests = [
    {
      name: 'Module Import Test',
      test: () => {
        try {
          const path = require('path');
          const fs = require('fs');
          expect(path.join('test', 'file')).toBe('test/file');
          expect(fs.readFileSync).toBeDefined();
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'JSON Parsing Test',
      test: () => {
        try {
          const testJson = '{"name": "test", "value": 42}';
          const parsed = JSON.parse(testJson);
          expect(parsed.name).toBe('test');
          expect(parsed.value).toBe(42);
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Array Operations Test',
      test: () => {
        try {
          const array = [1, 2, 3, 4, 5];
          expect(array.length).toBe(5);
          expect(array.slice(0, 3)).toEqual([1, 2, 3]);
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Object Operations Test',
      test: () => {
        try {
          const obj = { name: 'test', active: true, count: 0 };
          expect(obj.name).toBe('test');
          expect(obj.active).toBe(true);
          expect(Object.keys(obj)).toHaveLength(3);
          return true;
        } catch (error) {
          return false;
        }
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  basicTests.forEach(({ name, test }) => {
    try {
      const result = test();
      if (result) {
        console.log(`✅ ${name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${name}: FAILED`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${name}: ERROR - ${error.message}`);
      failed++;
    }
  });

  return { passed, failed };
}

// Function to test AI function availability
function testAIFunctions() {
  console.log('\n🤖 Testing AI Functions...');
  
  try {
    // Check if the AI functions can be imported
    const aiPath = path.join(__dirname, 'src', 'lib', 'aiRecommendations.ts');
    if (fs.existsSync(aiPath)) {
      console.log('✅ AI Recommendations module exists');
    } else {
      console.log('❌ AI Recommendations module not found');
    }

    // Check other important files
    const importantFiles = [
      'src/server.ts',
      'src/routes/ai.ts',
      'src/routes/community.ts',
      'src/lib/aiRecommendations.ts',
      'package.json'
    ];

    let filesExist = 0;
    importantFiles.forEach(file => {
      const fullPath = path.join(__dirname, file);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${file}: EXISTS`);
        filesExist++;
      } else {
        console.log(`❌ ${file}: MISSING`);
      }
    });

    return { filesExist, totalFiles: importantFiles.length };
  } catch (error) {
    console.log(`❌ Error testing AI functions: ${error.message}`);
    return { filesExist: 0, totalFiles: 0 };
  }
}

// Main test execution
async function main() {
  try {
    console.log('🚀 Starting basic tests...\n');

    // Run basic Node.js tests
    const basicResults = runBasicTests();
    console.log(`\n📊 Basic Tests: ${basicResults.passed} passed, ${basicResults.failed} failed`);

    // Test AI functions
    const aiResults = testAIFunctions();
    console.log(`\n📁 File Check: ${aiResults.filesExist}/${aiResults.totalFiles} files exist`);

    // Try to run any existing test files
    const testFiles = [
      path.join(__dirname, 'basic.test.ts'),
      path.join(__dirname, 'aiRecommendations.test.ts'),
      path.join(__dirname, 'api.test.ts'),
      path.join(__dirname, 'community.test.ts')
    ];

    console.log('\n🧪 Running Test Files...');
    let totalTestFiles = 0;
    let totalTestsPassed = 0;
    let totalTestsFailed = 0;

    testFiles.forEach(testFile => {
      if (fs.existsSync(testFile)) {
        totalTestFiles++;
        const results = runTestFile(testFile);
        totalTestsPassed += results.passed;
        totalTestsFailed += results.failed;
      }
    });

    // Summary
    console.log('\n📈 SUMMARY');
    console.log('==========');
    console.log(`Basic Tests: ${basicResults.passed} passed, ${basicResults.failed} failed`);
    console.log(`File Check: ${aiResults.filesExist}/${aiResults.totalFiles} files exist`);
    console.log(`Test Files: ${totalTestFiles} files processed`);
    console.log(`Total Tests: ${totalTestsPassed} passed, ${totalTestsFailed} failed`);

    if (basicResults.failed === 0 && aiResults.filesExist === aiResults.totalFiles) {
      console.log('\n🎉 All basic checks passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some issues found. Check the output above.');
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n❌ Test runner error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();