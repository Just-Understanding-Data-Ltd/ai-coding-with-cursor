# Turn off pylint for this file
# pylint: disable=all
# Turn off mypy for this file

import os
import json
import asyncio
from typing import List, Dict, Optional
from pydantic import BaseModel, Field, ValidationError
from openai import AsyncOpenAI

# Define our Pydantic models for the poll results
class PollResult(BaseModel):
    brand: str
    count: int

class PollResults(BaseModel):
    poll_results: List[PollResult]

class BrandChoice(BaseModel):
    """Model for a single persona's brand choice"""
    brand: str

# Define a response format for tallying
class TallyRequest(BaseModel):
    brand_counts: Dict[str, int] = Field(..., description="Dictionary of brand names and their counts")

class TallyResponse(BaseModel):
    poll_results: List[PollResult] = Field(..., description="List of poll results sorted by count")

async def tally_results(openai: AsyncOpenAI, brand_counts: Dict[str, int]) -> PollResults:
    """Use the model to tally and sort the results using Structured Outputs."""
    try:
        tally_request = TallyRequest(brand_counts=brand_counts)
        
        completion = await openai.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that tallies poll results."},
                {"role": "user", "content": f"Please tally these poll results and sort them from highest to lowest count: {tally_request.model_dump_json()}"}
            ],
            response_format=TallyResponse,
        )
        
        if hasattr(completion.choices[0].message, 'parsed') and completion.choices[0].message.parsed is not None:
            return PollResults(poll_results=completion.choices[0].message.parsed.poll_results)
        
        # Fallback if structured parsing fails
        poll_results = [
            PollResult(brand=brand, count=count)
            for brand, count in brand_counts.items()
        ]
        poll_results.sort(key=lambda x: x.count, reverse=True)
        return PollResults(poll_results=poll_results)
    
    except Exception as e:
        print(f"Error tallying results: {e}")
        # Fallback to manual tallying
        poll_results = [
            PollResult(brand=brand, count=count)
            for brand, count in brand_counts.items()
        ]
        poll_results.sort(key=lambda x: x.count, reverse=True)
        return PollResults(poll_results=poll_results)

async def ask_persona(openai: AsyncOpenAI, persona: str, brand_names: List[str]) -> str:
    """Ask a single persona to choose a brand from the list using Structured Outputs."""
    persona_prompt = (
        f"You are simulating the response of: {persona}\n"
        f"You need to choose ONE brand from this list that you would prefer: {', '.join(brand_names)}.\n"
        f"Return just the brand name."
    )
    
    try:
        # Use parse method for structured output
        completion = await openai.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": '''You are simulating a specific persona making a brand choice. Here is some information about the future product:
                 I have 2x feature ideas for my app

1. 🚀 Imagine instantly knowing exactly which content themes and formats will drive massive engagement because YOUR AI agent analyzed thousands of videos across TikTok and IG.

Now you can:
- Access instant, data-driven content ideas
- Automate hashtag discovery for maximum reach
- Use visual analytics dashboards to make smarter decisions
- Easily replicate viral video success

Transform your content from good to unstoppable! Claim your early access—waitlist link in comments! 👇

#MarketingAI #SocialMediaAnalytics #SocialMediaMarketing

2. Social media commenting inbox with AI, here is a competitor:


Pricing
Roadmap
FAQ
Log In
Start Free Trial
Convert more sales with smarter engagement
Moderate comments, manage conversations at scale, and increase your sales with AI.

Start Free Trial
Book a Demo

Trusted by hundreds of global brands






BBC logo






BBC logo
Every social platform in one place
Manage conversations, moderate comments, and craft responses from one
place.

Boost your ROAS with Automated Moderation
Automatically hides negative comments and spam in real-time
24/7 coverage across ads and organic posts
Protects your ad spend from trolls
Start Free Trial


Drive engagement with AI Generated Replies
Trained on custom information about your brand, products or services
Consistently accurate, humanlike replies that match your brand's tone
Learns and improves the more you use Brandwise over time
Start Free Trial
Discover opportunities with Obie
AI assistant that performs analysis across thousands of your brand's comments
Finds the most common FAQs and concerns in your ad comments
Provides insights on how to improve your marketing and operations
Start Free Trial

Made for modern teams

Analytics
In-depth analytics across all social pages and individual team members.


DMs & Mentions
Monitor comments, mentions, and DMs across every platform in one place.


Post Viewer
View the full post and comment threads without switching apps.


2-way Translation
Automatically translate incoming comments and replies to any language.


Blacklist
Automatically hide comments containing certain words or phrases.


Bulk Actions
Select several comments and perform bulk actions.

Frequently asked questions
Find answers to your questions right here, and don't hesitate to contact us if you couldn't find what you're looking for.


What platforms do you support?
Facebook, Instagram and TikTok


What counts against my AI credit usage?

How quickly are comments moderated?

Does this work for ads?

How does the AI replies work?
Get started with Brandwise today
Try Brandwise free for 7 days—you'll have access to every feature. Cancel any time.

Start Free Trial
Book a Demo


Your AI-powered Brand Manager




© 2024 Brandwise. All Rights Reserved.

Product
Pricing
Book a Demo
Roadmap
Company
Affiliate Program
Contact Us
Resources
Blog
Articles
Help Center
Legal
Privacy Policy
Terms of Service


-----

I need brand names that are unique and work well for the entire brand, rather than a feature led name?

Here are some examples:
Generic Names

* Socialpulse
* ContentCompass
* 

Names

* ReplyDeck
* CommentFlow
* RelateFlow
* Replywise

---

Remix these words like social, compass, deck, relate, reply, wise and other synconms

The core jobs to be done is managing lots of clients and doing great work for those clients, i.e. content strategy, creating content and publishing content.
                 
                  '''},
                {"role": "user", "content": persona_prompt}
            ],
            response_format=BrandChoice,
        )
        
        # Check if we got a valid parsed response
        message = completion.choices[0].message
        if hasattr(message, 'parsed') and message.parsed is not None:
            brand_choice = message.parsed.brand
            print(f"{persona} chose: {brand_choice}")
            
            # Try to match the response to one of the brand names (case insensitive)
            for brand in brand_names:
                if brand.lower() == brand_choice.lower():
                    return brand
                    
            # If no exact match found but valid brand returned
            return brand_choice
        
        # Handle refusal or other issues
        if hasattr(message, 'refusal'):
            print(f"{persona} refused to choose: {message.refusal}")
            return "No choice"
            
        # Fallback
        return "Unknown brand"
        
    except Exception as e:
        print(f"Error for {persona}: {e}")
        # Return a fallback value if there's an error
        return "Unknown brand"

async def main():
    # Ask the user for a comma-separated list of brand names.
    brand_input = input("Enter comma-separated brand names: ")
    brand_names = [name.strip() for name in brand_input.split(",") if name.strip()]

    # Generate 30 fake personas (freelance social media marketers).
    fake_personas = []
    try:
        from faker import Faker
        fake = Faker()
        for _ in range(30):
            name = fake.name()
            persona = f"Freelance Social Media Marketer: {name}"
            fake_personas.append(persona)
    except ImportError:
        # Fallback if Faker is not installed.
        fake_personas = [f"Freelance Social Media Marketer: Person {i+1}" for i in range(30)]

    openai = AsyncOpenAI()
    try:
        print(f"Making individual requests for {len(fake_personas)} personas...")
        
        # Create a list of tasks, one for each persona
        tasks = []
        for persona in fake_personas:
            task = ask_persona(openai, persona, brand_names)
            tasks.append(task)
        
        # Gather the responses asynchronously
        brand_choices = await asyncio.gather(*tasks)
        
        # Count the brands
        brand_counts: Dict[str, int] = {} # type: ignore
        for brand in brand_choices:
            if brand:  # Skip empty responses
                brand_counts[brand] = brand_counts.get(brand, 0) + 1
        
        print("\nRaw brand counts:", brand_counts)
        
        # Use structured outputs to tally the results
        structured_output = await tally_results(openai, brand_counts)
        
        # Display results
        print("\nPoll Results:")
        print(structured_output.model_dump_json(indent=4))

    except Exception as e:
        print("An error occurred during the API calls:")
        print(e)

if __name__ == "__main__":
    asyncio.run(main())
