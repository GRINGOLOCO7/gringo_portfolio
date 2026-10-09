# Before you share the link

Everything on the site comes from `me.md`, your CV, the AIfred project site, the arXiv listing, or
the project repositories. These are the points where the sources disagreed, were missing, or will
go out of date.

---

## Do these first

1. ~~**LinkedIn is missing.**~~ Done — `linkedin.com/in/gregorio-orlando-a482b8295` is now wired into
   the hero buttons, the footer, and the `sameAs` list in the page's structured data.

2. **The published CV contains your phone number.** It sits at
   `assets/cv/Gregorio-Orlando-CV.pdf` and is linked from the hero and the footer. Swap in a version
   without the number if you would rather it was not indexed.

3. **Check the repository is public and Pages is on.** Settings → Pages → deploy from `main`, root.

---

## Check the wording

4. **Your contribution lines.** Two are reasonable inferences from first authorship plus your CV, and
   only you can make them exact:
   - AIfred — *"I built the system and ran the 36-person study."*
   - PolyWall — *"Six months at the SnT Automation & Robotics Group, on the conversion step."*

   Admissions committees read these closely. Make them precisely true, including what Milan Groshev,
   Eduardo Castelló Ferrer and the SnT group contributed.

5. **Lab name.** Your CV says *IE Robotics and AI Lab*; `me.md` says the current wording is
   *CyPhyLife*; the AIfred paper says *CyPhy Life*. The site uses the first and shows both in the
   About panel. Align with whatever is formally correct.

6. **Formula Student team.** Your CV writes "UCIII Team"; the site renders this as **UC3M**
   (Universidad Carlos III de Madrid). Correct it if that is wrong.

7. **SLAM stack naming.** `me.md` §5 calls it *HICS-SLAM*; your own reference list points to
   **S-Graphs** (`snt-arg/lidar_situational_graphs`). The site links S-Graphs. Confirm which belongs.

8. **OSHWDem year.** Your CV says *November 2022*; the Minotauro README says *2023*, and the
   repository was created and pushed in **October 2023**. The site names the competition and city
   without a year. Worth fixing on the CV.

---

## The numbers

9. **The AIfred figures come from the published paper and project site, not from `me.md`.** `me.md`
   §4.9 holds earlier working values (~30 participants, 6.5 vs 7.7) and flags them as unreconciled.
   The site uses the final figures:

   | Shown | Source |
   |---|---|
   | 36 participants | project site / paper |
   | 7.0 vs 4.4 of 10 unassisted, p = .003 | project site / arXiv abstract |
   | 33 of 36 drawings ranked first, Kendall's W = .86 | project site |
   | 1 vs 63 context switches | project site |
   | 4.5 vs 3.4 of 5 perceived learning support, p < .001 | project site |

   Confirm each against the final manuscript. The site says plainly that the systems were
   **comparable while assistance was available** and only diverged afterwards — keep that framing.

10. **PolyWall's 236× is a triangle count**, and the page says so. If you have frame-time, memory or
    fidelity numbers, add them; they would make the claim much stronger.

11. **Minotauro's mass.** The repository README says 454 g; the photo on the site shows a scale
    reading 453. The text uses 454 g. Pick one.

---

## Keep up to date

12. **ICRA 2027 is written as "under review"** wherever it appears. Change it when the decision
    lands — and not to "accepted" before then.

13. **Graduation** reads *expected July 2026*. Replace with the awarded degree and final grade.

14. **`snt-arg/polywall` is not publicly accessible**, so the site links the S-Graphs SLAM stack
    instead. If the repo opens up, link it from the PolyWall block.

15. **PolyWall poster.** The VR Summit / RUB VRS poster is not shown — `projects_assets/polywall/`
    has the figures but not the poster itself. Drop `poster.png` in and add it if you want it on
    the page.

---

## Media you could still add

The site is fully illustrated, but these would strengthen it:

- **A portrait of you at work.** The About panel currently uses a photo of the lab's robots. A candid
  of you at the bench, looking at the robot rather than the camera, would be better.
- **A HoloLens capture for PolyWall** — the polygonal model registered against the real room, seen
  through the headset. It is the one shot that proves the pipeline ran end to end.
- **Botzo walking on the learned policy**, once sim-to-real works. The page currently says the Isaac
  Lab policy is not yet validated on hardware, which is accurate — update it when it is.

Drop originals into `projects_assets/<project>/`, add a line to `tools/build-assets.py`, re-run it,
and reference the output in `index.html`. See `README.md`.
