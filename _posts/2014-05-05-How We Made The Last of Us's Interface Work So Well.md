---
layout: post
author: Alexandria Neonakis
title: How We Made The Last of Us's Interface Work So Well
image: assets/images/Kotaku/tbcsp7kdgpynpwxtyihr.png
alt: How We Made The Last of Us's Interface Work So Well
credit: "Alexandria Neonakis is a UI designer at Naughty Dog. You can find her on Twitter at @beavs. "
---

**When I started** at Naughty Dog in November of 2012, the studio never had a dedicated UI (user interface) designer or artist before. There were eight months left in development of The Last of Us and while some of the UI elements had already been roughed out, an overall design of the HUD (heads up display) had not been established, and many things were still undecided. It became my responsibility to figure out the flow of our HUD and menu systems; to work with the programmers and game designers to implement, test and iterate; and finally to skin everything to make sure it fit the established aesthetic of the game.

This project was a unique challenge for a lot of reasons, the most obvious being the timeline. Eight months is not a lot of time to complete a full UI from wireframe to final polish with only two people dedicated to it. Our main UI programmer on The Last of Us Paul Burg and I worked to come up with a system to quickly design, implement and iterate on all of the elements. The pipeline we found worked the best for us was wireframe, implement, iterate, and then style and polish.

Within this piece, I want to walk through our process which eventually got us to the final UI and HUD design that you see in the game.

## Original Design

![How We Made The Last of Us's Interface Work So Well](/assets/images/Kotaku/ewolxambgabfdlx4o16y.png)

The weapon slotting system that existed when I started was the same one shown in The Last of Us's E3 demo. Weapons, ammo, health and consumables appeared in the top left corner of the screen. Right and left on the D-pad would shuffle through all of your weapons; up and down went through consumables.

When this system was implemented it was assumed that when Joel picked up a new weapon, he would drop the one he was currently holding (just like in Uncharted). After testing out this system, the game design team decided that it would make more sense for Joel to keep all of the weapons he finds. This would allow the player to choose the weapon they felt was best for any given encounter, giving them more control over how they played the game. It also opened the door for a weapon upgrading system. We started to design alternatives to the implemented system based on these updated design requirements.

## Wireframes

![How We Made The Last of Us's Interface Work So Well](/assets/images/Kotaku/da12g8h4jna8otokbfv5.png)

I created the basic wireframes in Photoshop. When I designed the wireframes, I didn't bother focusing on how things would look. Instead, I focused on how it would feel and function. If you can get something to feel right, then you can dress it up however you want later.

The main thing that you generally hear people complain about with UI is not how it looks, but that there's too much cluttering the screen, and/or that it feels clunky to use.

![How We Made The Last of Us's Interface Work So Well](/assets/images/Kotaku/twi6msgzzzwqtzg2pkzc.png)

Many of the early mockups showed a menu system where the player could swap weapons out and also upgrade them. I initially wanted these systems to appear together on the same screen. My reasoning for this is that when additions like upgrades are designated to their own screen, I have a tendency to ignore them until I absolutely have to use them. In many games, I'll hit an encounter, die a hundred times and think to myself "what am I doing wrong?" then I'll go on the internet and realize I haven't been upgrading my weapons. This is generally because I saw that upgrade screen one time and forgot about it.

The idea of combining these systems stuck in my head, but as I mentioned, people don't like UI screens that are too cluttered. As you can tell from the mockup, there would be a lot of information on that one screen. Therefore, we separated the systems out for the first implementation.

## Implementation

After weeks of back and forth on various Photoshop mockups, we tried implementing the following system:

Left and right on the d-pad would swap between the guns the player had slotted. These would appear along with the health circle at the bottom of the screen.

![How We Made The Last of Us's Interface Work So Well](/assets/images/Kotaku/wdhgrljtzxq3t7svaxue.png)

The player could select which guns they wanted in these slots within the weapon slotting menu. This was a part of the select menus, along with crafting, collectibles and upgrades.

We placed it here because we wanted "swapping" guns to have the same feeling that crafting did. In real life, a person would have to take their backpack off and rifle through it to get what they needed. In a combat situation this would cause high tension, which is what we were aiming for in order to make the game feel believable.

When in that menu, left and right on the d-pad would select the slot you wanted to change, and then you'd use the left analog stick to navigate to the gun you wanted to slot in. The inner ring showed all short guns, the outer ring long guns, and the slot you had selected with the d-pad determined which of those was highlighted.

![How We Made The Last of Us's Interface Work So Well](/assets/images/Kotaku/cebr52ufnatfgmrpc8er.png)

Upgrades were the next tab over.

## Iteration

![How We Made The Last of Us's Interface Work So Well](/assets/images/Kotaku/jf7l9tnt6wkpnrniybr0.png)

After testing that version for a bit we switched to a list version. The inner outer ring thing felt clunky and slow, which was exactly what we didn't want. In this version you can see that we brought upgrades back into the same menu as swapping. Pressing triangle would bring up a submenu to upgrade that weapon. We ended up scrapping this idea, too.

The main issue with this system is that it would be fine if any time you wanted to swap your gun you were safely hidden out of enemy sight and had all the time in the world to perform these actions. However, in testing, it very quickly became clear that more often than not, you're swapping your gun while in combat. For example, you'd be in the middle of some crazy encounter full of clickers, you'd use all your ammo and would have to quickly get into the menus, switch guns and then get back out.

Having to actually go into the select menus for that was very cumbersome. It was frustrating to play and rarely felt smooth. It often felt awkward and really clunky (again). It didn't actually feel believable at all. The amount of frustration you got from this system outweighed any real life believability it may have given the story.

Sometimes, for something to feel immersive, you need to make decisions that seem counter-intuitive to what you think would make something feel real or believable. One or two times when playing, it might have worked as we intended and felt awesome to swap that gun out right in the nick of time, but the vast majority of the time it just felt poorly designed.

When designing UI, if it feels cool the first few times, that's not always a good indicator. The overall UI has to feel cool the next hundred times. In fact, it should actually start to feel better with time to the point where it becomes natural feeling and you start to lose awareness of the UI at all. If it ever feels clunky, annoying or frustrating, then it's the wrong solution. When that happens, as a designer, you need to start all over again. In some cases, you have to throw out the ideas you feel pretty strongly about, too. I was adamant that upgrades and weapon slotting should be bound together, but testing and iterating proved me wrong.

## Final Design and Skinning

![How We Made The Last of Us's Interface Work So Well](/assets/images/Kotaku/lquncmdrvnibu9iyaj9m.png)

The final design would require separating upgrades completely from weapon slotting, but I was fine with this because it wasn't worth keeping them together if it meant compromising how it felt to play the game. Once we pulled upgrades out and made it a simple left, right, and hold x to re-slot, we were faced with the issue of what to do with upgrades.

![How We Made The Last of Us's Interface Work So Well](/assets/images/Kotaku/q9i1i76os9cvzve8o0mg.png)

Initially, upgrades just stayed in the select menu. They were on their own screen, and you'd get a little exclamation point next to the icon at the top when you had enough parts to upgrade something.

The problem with this was twofold. First, it didn't solve the initial problem I had with upgrade menus being hidden away in screens that you're not being prompted to use frequently. Second, some people would just get the first upgrade possible instead of saving their parts for bigger and better upgrades. Testers were often just upgrading the same handful of guns that were cheap to upgrade.

## .and more iteration!

![How We Made The Last of Us's Interface Work So Well](/assets/images/Kotaku/pnpd98115ueoahtrkekb.png)

The game designers came up with a solution to both of these problems in the form of the upgrade benches. These benches were specific points in the world where you could upgrade your weapons. Players would be gathering parts, aware that they were getting something, but not sure how much they had or even what they could do with those parts until they reached the benches.

At each bench, players could then take the time to look through all of their options, plan for when they'd come across a new bench, and experiment with upgrading. This resulted in a more varied play style. People upgraded the weapons they enjoyed using the most, not just the one with the cheapest upgrade costs. Also, very few people ran right past the benches; most people took the time and actually used the system. So, both problems were solved and everyone was happy.

## The Technical Issues

The technical pipeline was its own challenge in itself. All of our UI in TLOU was controlled through script. We didn't have a visual system in place like Scaleform, Unity, or UDK, where artists could go in, place assets visually and then hand that off to the programmer/scripter.

In our system, I would separate the individual elements, put them into our internal texture tool, and then get them into a big universal Maya HUD file. After that, Paul would set everything up and then give me hooks in a script file where I could move elements around on the screen by changing X and Y coordinates. Once everything was set up, I could swap out assets by simply changing them in the texture tool and in the Maya file, or changing the texture path being referenced in script.

Any animated transitions were hard-coded. I would give either flash mockups of how I wanted things to work or I'd talk it through with Paul or other programmers until we got something close. Because of this restriction, nice smooth transitions were difficult, especially in the time we had left to complete the project.

This was tedious and at times incredibly frustrating, but it also meant that we all had to be pretty creative in how things were designed. A result of this limitation was that all of our HUD elements were very simple. We avoided using elements completely where we could get away with nothing on the screen and we really made a conscious effort to keep everything as simple as possible.

This worked out for the best. We ended up with a very minimal UI, which probably worked in our favor since if we're being honest no one really loves UI. UI designers love it; the rest of the world just gives you weird looks when you talk lovingly about how smooth and seamless the UI was in an app you just saw. (Monument Valley… your UI is perfect, you're perfect. everyone go play Monument Valley. It's perfect.)

## Overview and Next Gen

That's an overview of just one of the UI elements from when I started it to completion. We primarily used the same system for all the other elements: Wireframe, implement, test, iterate and skin.

While programming was working on implementation of one element, I would move on to some other element, either coming up with new wireframes based on test results, or moving things around once they had already been implemented. Using this system, we were able to quickly and efficiently power through all UI elements and menus of the game.

Moving forward into the next generation of consoles, we're still using the pipeline that we established during those final months of The Last of Us. We should now have a lot more time to iterate, try new things, and experiment with better tools, but the basic system of quick prototyping worked for us. We'll improve on that with a full development cycle, which will help us to be able to really push concepts and experiment with finding the best way to give the player the information they need when playing.