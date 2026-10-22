<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Clinic data and demo sign-in live in src/lib/clinic-store.ts (localStorage) behind useDb/updateDb/useSession; role rules live in can() in src/lib/clinic.ts — why: Cloud was unavailable, and this keeps one seam to swap for a real backend.
