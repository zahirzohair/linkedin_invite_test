describe("LinkedIn Invite Test", () => {
  it("Visit Profile Pages", () => {
    cy.readFile("cypress/assets/profile_links.txt").then((links) => {

      const email = Cypress.env("LINKEDIN_EMAIL");
      const password = Cypress.env("LINKEDIN_PASSWORD");
    
      cy.visit('https://linkedin.com/login');

      cy.get('input[name="session_key"]').type(email);
      cy.get('input[name="session_password"]').type(password);
      cy.get('button[type="submit"]').click();

      cy.url().should("include", "linkedin.com/feed/")

      let failedProfiles = 0;
      const profileLinks = links.split(",");
      profileLinks.forEach((link) => {
        const profileLinksCount = profileLinks.length;
        
        // Visit the profile page
          cy.visit(link, { failOnStatusCode: false });

          cy.get('body').then(($body) => {
            if ($body.text().includes('This page doesn’t exist')) {
              // Invalid profile
              cy.log(`Profile page not found for ${link}`);
              failedProfiles++;
            } 
            else {
              // Valid profile

              // Check if you are already connected to this user
                cy.get("button").contains("Connected").should("not.exist");
            
                // Check if a "Connect" button is present
                cy.get("button").contains("Connect").then((connectButton) => {
                  // const connectButton = document.querySelector('#ember74');
                  if (connectButton.length > 0) {
                    // Click the "Connect" button
                    connectButton.click();

                    cy.get("button").contains("Add a note").click();
                    //Logic to customize the connection message
                    cy.get('textarea[name="message"]').type("Hello, let's connect!");

                    // Send the connection request
                    cy.get("button").contains("Send").click();
                  } else {
                    // Handle the case when a connection request button is not found
                    // This user may be already connected or other conditions apply
                    cy.log("Connection request button not found or already connected.");
                  }
                }); 
            }
          });

        // Generate the report using the custom Cypress command
        cy.generateReport(profileLinksCount, failedProfiles);
      });
    });
  });

  Cypress.Commands.add("generateReport", (profileLinksCount, failedProfiles) => {
    // Define the report content
    const reportContent = `Total Profiles Processed: ${profileLinksCount}
    Total Profiles Failed: ${failedProfiles}`;
  
    // Save the report to a text file
    cy.writeFile("linkedin_invite_report.txt", reportContent);
  
    // Log the report to the Cypress console for visibility
    cy.log(reportContent);
  });
  
});