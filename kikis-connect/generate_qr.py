# # code for image generation 

import segno

# Generate QR with a Kiki-themed message

url = "https://kikisconnect-pi.vercel.app/"#"https://stackoverflow.com/questions/881092/how-to-merge-a-specific-commit-in-git"
qr_kiki = segno.make_qr(url)


qr_kiki.save(
    "kiki_ghibli_qr.png",
    scale=7,
    border=2,
    dark="#2c3e50",    # Deep navy blue, like Kiki's dress
    light="#fdf6e3",   # Soft cream, vintage-style background
    finder_dark="#e74c3c",  # A touch of Kiki's red bow
    finder_light="#fdf6e3",  # Match background for harmony
)

