this document is about what i remarque in the ui interface
    - in select surah: the font of the dropdown list is white in white background it must be black font within white background 

    - in duration bar: is from 1 to 365 thats good but is difficult to set an exacte number by draging the so we want to find a solution here:
        - by add number ranges in the bar like 1,5,10....., to let the user can see where he put the bar exactely
        - or choose another good way to set the days number choosen
    
    - the generated plan is in english in both language mode, this is example of generated plan while im in arabic mod: (Lab Plan - 9:1-129 in 30 days
                📅 30 days
                📖 129 Verses
                📋 Daily Schedule
                Day 1
                5/25/2026
                8 min
                📖 Sabaq (New): Verses 1-5
                Day 2
                5/26/2026
                11 min
                📖 Sabaq (New): Verses 6-10
                🔄 Manzil (Revisions):
                Verses 1-5
                Day 3
                5/27/2026
                11 min
                📖 Sabaq (New): Verses 11-15
                🔄 Manzil (Revisions):
                Verses 6-10)
        
        - the generated plan should be included in language configurations
    
    - TEST this endpoints :  
        Quran Memorization Server running on http://localhost:3000 (this is good)
    📋 API available at http://localhost:3000/api (not work)
    🏥 Health check at http://localhost:3000/health (not work)
    📚 Auth routes: POST /api/auth/signup, POST /api/auth/login (not work)
    📝 Plan routes: POST /api/plans, GET /api/plans, DELETE /api/plans/:id (not work)
    📊 Progress routes: POST /api/progress/log, GET /api/progress/:planId (not work)