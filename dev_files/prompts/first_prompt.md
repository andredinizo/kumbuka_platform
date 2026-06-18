Help me plan this project. 
In @dev_files/plano_ex_plataforma.md there is the plan for the whole project EXCEPT from the purpose of this repo, which is to create a frontend to interact with the data managed by the pipeline described in the file. There is no plan for the purpose of this repo yet, this is the first thing we need to do.

The frontend we're gonna develop is an MVP, so we'll follow this rules:
    1. It needs to be writen in a simple way, without unecessary abstractions or "good practices" that will only be useful in the future
    2. We wont have a place to host a back or front end for this project. Right now a the data we're gonna handle is in sharepoint, so we'll have sharepoint as a "backend" (i'll bring to sharepoint the data that is not already there). For the frontend, it will need to be run on the client's computer, regardless of being an app or a self-hosted web page.
    3. Because this project is "an atempt", we'll need to have a detailed plan for everything that is built. This way, i can manually alter the plan and rebuild entire files from scratch if things go wrong. It's important that those detailed plans be writen in a tone that is optimezed for a LLM to build the features, but that they also are readable by a senior software developer.

About the solution:
    1. I don't have a definition for the tools we'll use yet, let's first define the features in terms of product and then choose the archtecture.
    2. The frontend will composed mainly of form-like pages and pages containing lists formated as tables.
    3. It needs to have the simplest possible user autentication (internal tool just for my team).
    4. It's important that every read/write to external data have their own method, because if i change the place where an extenal data is i can change just the specific method.

The features i already now we need (feel free to give more ideas if relevant):
    1. A list-like page to view the list of meeting recurrences that are aready being tracked by the system, and add or open one of them.
    2. A form-like page to create or edit a meeting recurrence.
    3. A list-like page to view the sumarization profiles, and add or open one of them. Also, it would be good to be able to go to the relevant sumarization profiles directly from a meeting recurrence.
    4. A form-like page to create or edit a sumarization profile.
    5. A list-like page to view the history of meeting occurrences.
    6. A form-like page to view the details of a meeting occurrence.
    7. A list-like page to view the history of transcriptions.
    8. A form-like page to view the details of a transcription, specially the transcription text (and download it as a file).
    9. A list-like page to view the history of sumarizations.
    10. A form-like page to view the details of a sumarization, specially the sumarization text (and download it as a file).
    11. A list-like page to view the history of platform costs    

